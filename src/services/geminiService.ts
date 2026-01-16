const API_KEY_STORAGE = 'stem_lab_gemini_key';
const SELECTED_MODEL_STORAGE = 'stem_lab_selected_model';

// Danh sách các model Gemini theo thứ tự ưu tiên
export const GEMINI_MODELS = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: 'Nhanh nhất, phù hợp cho hầu hết tác vụ', isDefault: true },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', description: 'Mạnh mẽ hơn, cho tác vụ phức tạp', isDefault: false },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Ổn định, dự phòng khi các model khác quá tải', isDefault: false }
];

export function getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE);
}

export function setApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key);
}

export function removeApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE);
}

export function getSelectedModel(): string {
    return localStorage.getItem(SELECTED_MODEL_STORAGE) || GEMINI_MODELS[0].id;
}

export function setSelectedModel(modelId: string): void {
    localStorage.setItem(SELECTED_MODEL_STORAGE, modelId);
}

import { SimulationType, VisualConfig } from '../types';

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
    // Dynamic simulation fields
    simulationType: SimulationType;
    visualConfig: VisualConfig;
}

// Hàm kiểm tra lỗi quota/rate limit
function isQuotaError(errorMessage: string): boolean {
    const quotaKeywords = ['quota', 'exceeded', 'rate limit', 'resource_exhausted', '429', '503'];
    const lowerMessage = errorMessage.toLowerCase();
    return quotaKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Hàm gọi API với cơ chế fallback tự động
async function callGeminiAPIWithFallback(
    apiKey: string,
    body: object,
    startModelIndex = 0
): Promise<{ response: Response; usedModel: string }> {
    const modelOrder = getModelFallbackOrder();

    for (let i = startModelIndex; i < modelOrder.length; i++) {
        const model = modelOrder[i];
        console.log(`🔄 Đang thử model: ${model}`);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            );

            // Nếu gặp lỗi quota (429, 503), thử model tiếp theo
            if (response.status === 429 || response.status === 503) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                console.log(`⚠️ Model ${model} bị lỗi: ${errorMessage}`);

                if (i < modelOrder.length - 1) {
                    console.log(`➡️ Chuyển sang model tiếp theo...`);
                    continue;
                }
                // Nếu là model cuối cùng, throw error
                throw new Error(`${response.status} RESOURCE_EXHAUSTED: ${errorMessage}`);
            }

            // Kiểm tra các lỗi khác
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `API Error: ${response.status}`;

                // Nếu lỗi quota trong message, thử model tiếp theo
                if (isQuotaError(errorMessage) && i < modelOrder.length - 1) {
                    console.log(`⚠️ Model ${model} quota exceeded: ${errorMessage}`);
                    continue;
                }

                // Lỗi khác (invalid key, etc.)
                if (response.status === 400 || response.status === 403) {
                    throw new Error('API_KEY_INVALID');
                }

                throw new Error(errorMessage);
            }

            console.log(`✅ Thành công với model: ${model}`);
            return { response, usedModel: model };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Nếu lỗi mạng hoặc quota, thử model tiếp theo
            if (isQuotaError(errorMessage) && i < modelOrder.length - 1) {
                console.log(`⚠️ Lỗi với model ${model}: ${errorMessage}`);
                continue;
            }

            // Nếu là model cuối hoặc lỗi khác, throw error
            throw error;
        }
    }

    throw new Error('QUOTA_EXCEEDED_ALL_MODELS: Tất cả các model đều đã hết quota. Vui lòng thử lại sau hoặc sử dụng API key khác.');
}

// Lấy thứ tự model fallback (bắt đầu từ model được chọn)
function getModelFallbackOrder(): string[] {
    const selectedModel = getSelectedModel();
    const modelIds = GEMINI_MODELS.map(m => m.id);
    const selectedIndex = modelIds.indexOf(selectedModel);

    if (selectedIndex === -1) return modelIds;

    // Đặt model được chọn lên đầu, các model còn lại theo thứ tự
    return [
        selectedModel,
        ...modelIds.filter(id => id !== selectedModel)
    ];
}

export async function analyzeAndGenerateExperiment(
    content: string,
    _fileType: 'text' | 'image'
): Promise<GeneratedExperiment> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API_KEY_REQUIRED');
    }

    const prompt = `Bạn là chuyên gia giáo dục STEM. Phân tích nội dung sau và tạo một thí nghiệm mô phỏng tương tác với đồ thị/animation trực quan.

NỘI DUNG:
${content}

QUAN TRỌNG: Bạn PHẢI chọn simulationType phù hợp để tạo mô phỏng trực quan:
- "projectile": Chuyển động ném xiên, ném ngang, rơi tự do (vẽ quỹ đạo parabol)
- "parabola": Đồ thị hàm số bậc 2 dạng y = ax² + bx + c
- "quadratic": Khảo sát hàm bậc 2, tìm đỉnh, trục đối xứng
- "linear": Đồ thị đường thẳng y = ax + b, phương trình bậc nhất
- "graph": Đồ thị hàm số tổng quát khác
- "pendulum": Con lắc đơn, dao động điều hòa
- "circuit": Mạch điện, định luật Ohm
- "chemistry": Phản ứng hóa học, axit-bazơ
- "wave": Sóng cơ, sóng âm, sóng điện từ
- "optics": Quang học, khúc xạ, phản xạ ánh sáng
- "default": Fallback cho các thí nghiệm khác

Trả về JSON với cấu trúc sau (chỉ trả về JSON, không giải thích):
{
  "title": "Tên thí nghiệm (tiếng Việt)",
  "subject": "Vật lý" hoặc "Hóa học" hoặc "Sinh học" hoặc "Toán",
  "difficulty_level": "Dễ" hoặc "Trung bình" hoặc "Khó",
  "short_description": "Mô tả ngắn về thí nghiệm (2-3 câu)",
  "learning_objectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "tools_instructions": ["Dụng cụ 1", "Dụng cụ 2", "Dụng cụ 3"],
  "simulation_config": "Công thức chính của thí nghiệm",
  "estimated_time": 30,
  "simulationType": "projectile",
  "visualConfig": {
    "xAxis": { "label": "x", "min": 0, "max": 100, "unit": "m" },
    "yAxis": { "label": "y", "min": 0, "max": 50, "unit": "m" },
    "curveEquation": "y = x * tan(theta) - (g * x^2) / (2 * v0^2 * cos(theta)^2)",
    "animationType": "trajectory",
    "showGrid": true,
    "showFormula": true,
    "animationSpeed": 5,
    "colors": { "primary": "#3b82f6", "secondary": "#10b981" }
  },
  "parameters": [
    {
      "id": "v0",
      "name": "Vận tốc đầu",
      "unit": "m/s",
      "min": 1,
      "max": 50,
      "step": 1,
      "defaultValue": 20
    },
    {
      "id": "theta",
      "name": "Góc bắn",
      "unit": "°",
      "min": 0,
      "max": 90,
      "step": 5,
      "defaultValue": 45
    },
    {
      "id": "g",
      "name": "Gia tốc trọng trường",
      "unit": "m/s²",
      "min": 1,
      "max": 20,
      "step": 0.5,
      "defaultValue": 9.8
    }
  ],
  "formulas": [
    {
      "outputId": "range",
      "outputName": "Tầm xa",
      "outputUnit": "m",
      "formula": "(v0^2 * sin(2*theta)) / g"
    },
    {
      "outputId": "maxHeight",
      "outputName": "Độ cao cực đại",
      "outputUnit": "m",
      "formula": "(v0^2 * sin(theta)^2) / (2*g)"
    }
  ]
}`;

    try {
        const { response } = await callGeminiAPIWithFallback(apiKey, {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

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

    const prompt = `Bạn là chuyên gia giáo dục STEM. Phân tích hình ảnh này (có thể là trang sách giáo khoa, giáo án, hoặc bài tập) và tạo một thí nghiệm mô phỏng tương tác với đồ thị/animation trực quan.

QUAN TRỌNG: Bạn PHẢI chọn simulationType phù hợp để tạo mô phỏng trực quan:
- "projectile": Chuyển động ném xiên, ném ngang, rơi tự do (vẽ quỹ đạo parabol)
- "parabola": Đồ thị hàm số bậc 2 dạng y = ax² + bx + c
- "quadratic": Khảo sát hàm bậc 2, tìm đỉnh, trục đối xứng
- "linear": Đồ thị đường thẳng y = ax + b, phương trình bậc nhất
- "graph": Đồ thị hàm số tổng quát khác
- "pendulum": Con lắc đơn, dao động điều hòa
- "circuit": Mạch điện, định luật Ohm
- "chemistry": Phản ứng hóa học, axit-bazơ
- "wave": Sóng cơ, sóng âm, sóng điện từ
- "optics": Quang học, khúc xạ, phản xạ ánh sáng
- "default": Fallback cho các thí nghiệm khác

Trả về JSON với cấu trúc sau (chỉ trả về JSON, không giải thích):
{
  "title": "Tên thí nghiệm (tiếng Việt)",
  "subject": "Vật lý" hoặc "Hóa học" hoặc "Sinh học" hoặc "Toán",
  "difficulty_level": "Dễ" hoặc "Trung bình" hoặc "Khó",
  "short_description": "Mô tả ngắn về thí nghiệm (2-3 câu)",
  "learning_objectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "tools_instructions": ["Dụng cụ 1", "Dụng cụ 2", "Dụng cụ 3"],
  "simulation_config": "Công thức chính của thí nghiệm",
  "estimated_time": 30,
  "simulationType": "projectile",
  "visualConfig": {
    "xAxis": { "label": "x", "min": 0, "max": 100, "unit": "m" },
    "yAxis": { "label": "y", "min": 0, "max": 50, "unit": "m" },
    "curveEquation": "công thức toán học",
    "animationType": "trajectory",
    "showGrid": true,
    "showFormula": true,
    "animationSpeed": 5,
    "colors": { "primary": "#3b82f6", "secondary": "#10b981" }
  },
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
      "formula": "công thức tính toán"
    }
  ]
}`;

    try {
        const { response } = await callGeminiAPIWithFallback(apiKey, {
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
        });

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
