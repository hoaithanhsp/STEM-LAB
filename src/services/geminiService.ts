const API_KEY_STORAGE = 'stem_lab_gemini_key';

export function getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE);
}

export function setApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key);
}

export function removeApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE);
}

export interface GeneratedExperiment {
    title: string;
    subject: string;
    difficulty_level: 'Dễ' | 'Trung bình' | 'Khó';
    short_description: string;
    learning_objectives: string[];
    tools_instructions: string[];
    simulation_config: string;
    estimated_time: number;
    parameters: {
        id: string;
        name: string;
        unit: string;
        min: number;
        max: number;
        step: number;
        defaultValue: number;
    }[];
    formulas: {
        outputId: string;
        outputName: string;
        outputUnit: string;
        formula: string;
    }[];
}

export async function analyzeAndGenerateExperiment(
    content: string,
    fileType: 'text' | 'image'
): Promise<GeneratedExperiment> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API_KEY_REQUIRED');
    }

    const prompt = `Bạn là chuyên gia giáo dục STEM. Phân tích nội dung sau và tạo một thí nghiệm mô phỏng tương tác.

NỘI DUNG:
${content}

Trả về JSON với cấu trúc sau (chỉ trả về JSON, không giải thích):
{
  "title": "Tên thí nghiệm (tiếng Việt)",
  "subject": "Vật lý" hoặc "Hóa học" hoặc "Sinh học",
  "difficulty_level": "Dễ" hoặc "Trung bình" hoặc "Khó",
  "short_description": "Mô tả ngắn về thí nghiệm (2-3 câu)",
  "learning_objectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "tools_instructions": ["Dụng cụ 1", "Dụng cụ 2", "Dụng cụ 3"],
  "simulation_config": "Công thức chính của thí nghiệm",
  "estimated_time": 30,
  "parameters": [
    {
      "id": "param1",
      "name": "Tên tham số",
      "unit": "đơn vị",
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 50
    }
  ],
  "formulas": [
    {
      "outputId": "result1",
      "outputName": "Tên kết quả",
      "outputUnit": "đơn vị",
      "formula": "param1 * 2"
    }
  ]
}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            if (response.status === 400 || response.status === 403) {
                throw new Error('API_KEY_INVALID');
            }
            throw new Error(error.error?.message || 'API Error');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from AI');
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        const result = JSON.parse(jsonMatch[0]) as GeneratedExperiment;
        return result;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

export async function analyzeImage(imageBase64: string): Promise<GeneratedExperiment> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API_KEY_REQUIRED');
    }

    const prompt = `Bạn là chuyên gia giáo dục STEM. Phân tích hình ảnh này (có thể là trang sách giáo khoa, giáo án, hoặc bài tập) và tạo một thí nghiệm mô phỏng tương tác phù hợp.

Trả về JSON với cấu trúc sau (chỉ trả về JSON, không giải thích):
{
  "title": "Tên thí nghiệm (tiếng Việt)",
  "subject": "Vật lý" hoặc "Hóa học" hoặc "Sinh học",
  "difficulty_level": "Dễ" hoặc "Trung bình" hoặc "Khó",
  "short_description": "Mô tả ngắn về thí nghiệm",
  "learning_objectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "tools_instructions": ["Dụng cụ 1", "Dụng cụ 2", "Dụng cụ 3"],
  "simulation_config": "Công thức chính của thí nghiệm",
  "estimated_time": 30,
  "parameters": [
    {
      "id": "param1",
      "name": "Tên tham số",
      "unit": "đơn vị",
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 50
    }
  ],
  "formulas": [
    {
      "outputId": "result1",
      "outputName": "Tên kết quả",
      "outputUnit": "đơn vị",
      "formula": "param1 * 2"
    }
  ]
}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: imageBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No response from AI');
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response');
        }

        return JSON.parse(jsonMatch[0]) as GeneratedExperiment;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}
