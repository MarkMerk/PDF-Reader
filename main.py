from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, ValidationError, Field
import shutil
import os
import logging
import io
import json
from fastapi.middleware.cors import CORSMiddleware

# --- NEW IMPORTS ---
from pypdf import PdfReader
import ollama # The official Ollama Python client

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models (Unchanged) ---

class Variable(BaseModel):
    """
    Defines the structure for a single extracted variable.
    """
    field_name: str = Field(..., description="The inferred Category or Field Name for the value (e.g., 'Geburtsdatum', 'Discount Rate', 'Performance Metric').")
    value: str = Field(..., description="The specific, extracted value or item found in the text (e.g., '21. November 2002', '10%', 'Maximum Load').")
    type: str = Field(..., description="The data type of the value (e.g., 'date', 'percentage', 'string').")
    description: str = Field(..., description="A concise explanation of the data point's context or significance from the document.")


class AnalysisResponse(BaseModel):
    """
    Defines the structure for the successful analysis response.
    """
    variables: list[Variable]
    filename: str
    content_type: str
    size_bytes: int
    document_text: str

class RefinementRequest(BaseModel):
    """
    Defines the structure for the refinement request.
    """
    document_text: str
    current_variables: list[Variable]

# --- Application Setup (Unchanged) ---

app = FastAPI(
    title="PDF Variable Extraction Service",
    description="Service to extract/refine variables from PDFs using Ollama and Mistral.",
    version="1.2.5" 
)

# --- CONFIGURATION (Unchanged) ---
OLLAMA_MODEL = "llama3" 
OLLAMA_HOST = "http://localhost:11434" 

# Initialize Ollama Client
try:
    ollama_client = ollama.Client(host=OLLAMA_HOST)
    logger.info(f"Ollama client initialized for model: {OLLAMA_MODEL} at {OLLAMA_HOST}")
except Exception as e:
    logger.warning(f"Could not initialize Ollama client immediately: {e}. Assuming Ollama will be available when the endpoint is called.")

# CORS Configuration (Unchanged)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UTILITY FUNCTIONS (get_variable_list_schema and extract_text_from_pdf are unchanged) ---

def get_variable_list_schema() -> dict:
    # ... (function body omitted, it is unchanged)
    class VariableListWrapper(BaseModel):
        data: list[Variable] 
    full_schema = VariableListWrapper.model_json_schema()
    array_schema = full_schema['properties']['data'].copy()
    if '$defs' in full_schema:
        array_schema['$defs'] = full_schema['$defs']
    if 'Variable' in array_schema.get('$defs', {}):
        array_schema['items'] = {'$ref': '#/$defs/Variable'}
    if 'title' in array_schema:
        del array_schema['title']
    return array_schema


def extract_text_from_pdf(file_object: io.BytesIO) -> str:
    # ... (function body omitted, it is unchanged)
    try:
        reader = PdfReader(file_object)
        text = ""
        for i, page in enumerate(reader.pages):
            text += page.extract_text()
            if i > 50 and len(text) > 20000:
                 break
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise HTTPException(status_code=400, detail="Could not read PDF file content.")

def get_refinement_prompt(extracted_text: str, current_variables: list[dict]) -> tuple[str, str]:
    """
    Generates the system and user prompts for the LLM to refine/complete a
    list of variables based on the document text.
    """

    variables_json = json.dumps(current_variables, indent=2)

    # System prompt adjusted to guide the LLM on filling in the input data
    refinement_system_prompt = f"""You are an expert **Data Refinement and Completion** tool.
Your task is to review the provided **DOCUMENT TEXT** and a **PARTIALLY COMPLETED JSON ARRAY** of variables.
You MUST analyze the document text to complete or correct the variables in the array.

**RULES FOR COMPLETION (STRICT JSON SCHEMA):**
1.  **Output Format:** The final output MUST be a **single, valid JSON ARRAY** of **all** variables, strictly conforming to the provided JSON schema.
2.  **No Wrapping:** Do not include any text, markdown, or code block delimiters outside the JSON array itself.
3.  **Completion Logic (STRICT):**
    * Only return the variables provided in the input array. **DO NOT ADD OR REMOVE ANY VARIABLES.**
    * For existing variables, or for new variables added by the user (which may only have a `field_name`), use the document text to fill in all missing or placeholder fields (`value`, `type`, and `description`).
    * Preserve the exact order of the input array.

Generate the **COMPLETED/REFINED** JSON ARRAY now:"""

    refinement_user_prompt = f"""
Document Text (Full context for deep analysis):
---
{extracted_text}
---

Current Variables Array to Refine:
---
{variables_json}
---
"""
    return refinement_system_prompt, refinement_user_prompt


# --- ENDPOINT DEFINITIONS (analyze-pdf omitted for brevity) ---

@app.post("/analyze-pdf", response_model=AnalysisResponse, status_code=200)
async def analyze_pdf(
    pdf_file: UploadFile = File(..., description="The PDF file to be analyzed.")
):
    # ... (function body omitted, it is unchanged)
    if pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are accepted.")

    content = await pdf_file.read()
    file_size = len(content)
    pdf_file_buffer = io.BytesIO(content)

    try:
        extracted_text = extract_text_from_pdf(pdf_file_buffer)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="The PDF contains no extractable text.")

        system_prompt = """You are an expert **General Data Extraction** tool. Your task is to perform an **EXHAUSTIVE** analysis of the provided document text and extract **ALL** structured data points.
        
**CRITICAL RULE FOR EXTRACTION:**
1.  **Output Format:** The final output MUST be a **single, valid JSON ARRAY** of objects, strictly conforming to the provided schema. Do not include any text, markdown, or code block delimiters outside the JSON array itself.
2.  **Field Definitions:**
    * **field_name**: The title/category of the data (e.g., 'Invoice Date', 'Total Price').
    * **value**: The exact data point found in the document (e.g., '2023-10-25', '£1,500.00').

Generate the JSON ARRAY based ONLY on the provided document text:"""

        context_text = extracted_text[:10000]
        user_prompt = f"""
Document Text:
---
{context_text}
---
Extract all relevant variables, parameters, or fields and present them as a JSON array now:
"""
        variable_list_schema = get_variable_list_schema()

        response = ollama_client.generate(
            model=OLLAMA_MODEL,
            prompt=user_prompt,
            system=system_prompt,
            format=variable_list_schema, 
            options={'temperature': 0.0}
        )
        llm_response_text = response['response'].strip()

        try:
             variables_list_pydantic = [Variable.model_validate(item) for item in json.loads(llm_response_text)]
             variables_list_cleaned_dicts = [v.model_dump() for v in variables_list_pydantic]
        except (json.JSONDecodeError, ValidationError, TypeError) as e:
            logger.error(f"[Initial Analysis] Failed to validate structured JSON from LLM: {e}")
            raise HTTPException(status_code=500, detail=f"AI returned an invalid structured output: {str(e)}")

        return AnalysisResponse(
            filename=pdf_file.filename,
            content_type=pdf_file.content_type,
            size_bytes=file_size,
            variables=variables_list_cleaned_dicts,
            document_text=extracted_text
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Uncaught Error during PDF processing: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error during file or AI processing: {str(e)}")


## 2. Refinement Endpoint
@app.post("/refine-variables", response_model=AnalysisResponse, status_code=200)
async def refine_variables(
    request: RefinementRequest
):
    if not request.document_text or not request.current_variables:
        raise HTTPException(status_code=400, detail="Missing document text or variable list for refinement.")

    current_variables_dicts = [v.model_dump() for v in request.current_variables]
    logger.info(f'Current variables count for refinement: {len(current_variables_dicts)}')

    # 1. Prepare the refinement prompt
    system_prompt, user_prompt = get_refinement_prompt(
        extracted_text=request.document_text,
        current_variables=current_variables_dicts
    )

    try:
        # 2. Call Ollama for refinement using Structured Output
        variable_list_schema = get_variable_list_schema()

        response = ollama_client.generate(
            model=OLLAMA_MODEL,
            prompt=user_prompt,
            system=system_prompt,
            format=variable_list_schema, 
            options={'temperature': 0.0}
        )

        # 3. Parse and Validate the Ollama Response
        llm_response_text = response['response'].strip()

        try:
             llm_returned_variables_pydantic = [Variable.model_validate(item) for item in json.loads(llm_response_text)]
             llm_returned_variables = [v.model_dump() for v in llm_returned_variables_pydantic]
        except (json.JSONDecodeError, ValidationError, TypeError) as e:
            logger.error(f"[Refinement] Failed to validate structured JSON from LLM: {e}")
            raise HTTPException(status_code=500, detail=f"AI returned an invalid structured output during refinement. Check terminal logs.")

        # --- MODIFIED MERGE LOGIC: FIXING REFINEMENT ON PARTIAL ROWS ---

        # 1. Create a map of the LLM's output using ONLY the field_name as the key.
        # This is the most stable and reliable identifier for the user's intent.
        llm_map = {}
        for var in llm_returned_variables:
            key = var['field_name'].strip().lower()
            if key:
                 # Note: If LLM returns duplicates, the last one wins. This is acceptable 
                 # as the LLM is instructed not to return duplicates.
                 llm_map[key] = var
        
        # 2. Iterate over the input variables and prioritize the LLM's full data
        # based on the field_name match.
        final_merged_variables = []
        
        for input_var in current_variables_dicts:
            input_key = input_var['field_name'].strip().lower()

            # If the input variable has a field_name and we found a match in the LLM's output
            if input_key and input_key in llm_map:
                # Use the refined, complete data from the LLM, preserving the order.
                final_merged_variables.append(llm_map[input_key])
            else:
                # Otherwise, keep the user's current input, even if it's incomplete.
                final_merged_variables.append(input_var)

        logger.info(f"Ollama refinement successful. Merged list contains {len(final_merged_variables)} variables.")
        # --- END MODIFIED MERGE LOGIC ---

        # 4. Return the successful response
        return AnalysisResponse(
            filename="Refined Data",
            content_type="application/json",
            size_bytes=0,
            variables=final_merged_variables,
            document_text=request.document_text
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Uncaught Error during Refinement: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error during AI refinement: {str(e)}")