import { Experiment, Achievement } from '../types';

// Mock Experiments Data
export const mockExperiments: Experiment[] = [
    {
        id: '1',
        title: 'Định luật Ohm - Mạch điện cơ bản',
        subject: 'Vật lý',
        difficulty_level: 'Dễ',
        short_description: 'Khám phá mối quan hệ giữa điện áp, dòng điện và điện trở trong mạch điện đơn giản. Thực hành đo đạc và tính toán theo định luật Ohm.',
        learning_objectives: [
            'Hiểu được định luật Ohm: U = I × R',
            'Biết cách đo điện áp, dòng điện và điện trở',
            'Vẽ được sơ đồ mạch điện đơn giản',
            'Tính toán các đại lượng điện cơ bản'
        ],
        tools_instructions: [
            'Nguồn điện DC có thể điều chỉnh (0-12V)',
            'Điện trở các loại (100Ω, 220Ω, 470Ω)',
            'Ampe kế và Vôn kế số',
            'Dây dẫn kết nối',
            'Breadboard thí nghiệm'
        ],
        simulation_config: 'U = I × R\nCông suất: P = U × I = I² × R = U²/R',
        estimated_time: 30,
        thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
        created_at: '2024-01-15'
    },
    {
        id: '2',
        title: 'Phản ứng axit-bazơ',
        subject: 'Hóa học',
        difficulty_level: 'Trung bình',
        short_description: 'Tìm hiểu phản ứng trung hòa giữa axit và bazơ, cách nhận biết và đo pH của dung dịch.',
        learning_objectives: [
            'Hiểu khái niệm axit và bazơ theo thuyết Arrhenius',
            'Thực hiện phản ứng trung hòa',
            'Sử dụng chỉ thị pH để xác định tính axit-bazơ',
            'Tính toán nồng độ dung dịch sau phản ứng'
        ],
        tools_instructions: [
            'Dung dịch HCl 0.1M',
            'Dung dịch NaOH 0.1M',
            'Giấy quỳ tím và phenolphtalein',
            'Pipet và bình định mức',
            'Cốc thủy tinh có vạch chia'
        ],
        simulation_config: 'HCl + NaOH → NaCl + H₂O\npH = -log[H⁺]',
        estimated_time: 45,
        thumbnail_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
        created_at: '2024-01-14'
    },
    {
        id: '3',
        title: 'Quan sát tế bào thực vật',
        subject: 'Sinh học',
        difficulty_level: 'Dễ',
        short_description: 'Sử dụng kính hiển vi để quan sát cấu trúc tế bào thực vật từ lá mồng tơi và củ hành tây.',
        learning_objectives: [
            'Biết cách sử dụng kính hiển vi quang học',
            'Nhận biết các thành phần cơ bản của tế bào thực vật',
            'Phân biệt thành tế bào, màng tế bào và nhân',
            'Vẽ và mô tả hình ảnh tế bào quan sát được'
        ],
        tools_instructions: [
            'Kính hiển vi quang học (100x - 400x)',
            'Lam kính và lam đậy',
            'Lá mồng tơi tươi',
            'Vảy hành tây trong suốt',
            'Thuốc nhuộm xanh methylene'
        ],
        estimated_time: 35,
        thumbnail_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400',
        created_at: '2024-01-13'
    },
    {
        id: '4',
        title: 'Con lắc đơn và dao động điều hòa',
        subject: 'Vật lý',
        difficulty_level: 'Trung bình',
        short_description: 'Nghiên cứu dao động của con lắc đơn, xác định chu kỳ dao động và các yếu tố ảnh hưởng.',
        learning_objectives: [
            'Hiểu khái niệm dao động điều hòa',
            'Xác định chu kỳ và tần số dao động con lắc đơn',
            'Tìm hiểu ảnh hưởng của chiều dài dây và gia tốc trọng trường',
            'Áp dụng công thức T = 2π√(l/g)'
        ],
        tools_instructions: [
            'Giá đỡ con lắc',
            'Quả nặng hình cầu (50g, 100g)',
            'Dây treo không giãn (0.5m, 1m, 1.5m)',
            'Đồng hồ bấm giây',
            'Thước đo chiều dài'
        ],
        simulation_config: 'T = 2π√(l/g)\nω = 2π/T = √(g/l)',
        estimated_time: 40,
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        created_at: '2024-01-12'
    },
    {
        id: '5',
        title: 'Khúc xạ ánh sáng qua lăng kính',
        subject: 'Vật lý',
        difficulty_level: 'Khó',
        short_description: 'Nghiên cứu hiện tượng khúc xạ và tán sắc ánh sáng khi đi qua lăng kính thủy tinh.',
        learning_objectives: [
            'Hiểu định luật khúc xạ ánh sáng Snell',
            'Quan sát hiện tượng tán sắc ánh sáng trắng',
            'Xác định góc lệch và góc lệch cực tiểu',
            'Tính chiết suất của lăng kính'
        ],
        tools_instructions: [
            'Lăng kính thủy tinh tam giác',
            'Đèn laser hoặc nguồn sáng trắng',
            'Thước đo góc (thước goniometer)',
            'Màn hứng sáng',
            'Giá đỡ quang học'
        ],
        simulation_config: 'n₁sinθ₁ = n₂sinθ₂\nn = sin[(A+Dm)/2] / sin(A/2)',
        estimated_time: 50,
        thumbnail_url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400',
        created_at: '2024-01-11'
    },
    {
        id: '6',
        title: 'Điện phân dung dịch muối',
        subject: 'Hóa học',
        difficulty_level: 'Khó',
        short_description: 'Thực hiện quá trình điện phân dung dịch CuSO₄ và quan sát sự di chuyển ion.',
        learning_objectives: [
            'Hiểu nguyên lý điện phân',
            'Phân biệt quá trình xảy ra ở catot và anot',
            'Quan sát sự tạo thành kim loại đồng',
            'Áp dụng định luật Faraday về điện phân'
        ],
        tools_instructions: [
            'Bình điện phân',
            'Dung dịch CuSO₄ 1M',
            'Điện cực đồng và graphit',
            'Nguồn điện DC 6V',
            'Ampe kế, dây dẫn'
        ],
        simulation_config: 'm = A.I.t / (n.F)\nCatot: Cu²⁺ + 2e⁻ → Cu\nAnot: 2H₂O → O₂ + 4H⁺ + 4e⁻',
        estimated_time: 60,
        thumbnail_url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400',
        created_at: '2024-01-10'
    },
    {
        id: '7',
        title: 'Đồ thị hàm số bậc hai',
        subject: 'Toán',
        difficulty_level: 'Trung bình',
        short_description: 'Khảo sát và vẽ đồ thị hàm số bậc hai y = ax² + bx + c. Tìm hiểu ảnh hưởng của các hệ số đến hình dạng parabol.',
        learning_objectives: [
            'Hiểu khái niệm hàm số bậc hai',
            'Xác định đỉnh, trục đối xứng của parabol',
            'Phân tích ảnh hưởng của hệ số a, b, c',
            'Tìm giao điểm với trục tọa độ'
        ],
        tools_instructions: [
            'Hệ trục tọa độ Oxy',
            'Thanh trượt điều chỉnh hệ số a, b, c',
            'Bảng giá trị x, y',
            'Công cụ vẽ đồ thị'
        ],
        simulation_config: 'y = ax² + bx + c\\nĐỉnh: x = -b/(2a)\\nΔ = b² - 4ac',
        estimated_time: 35,
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        created_at: '2024-01-09'
    },
    {
        id: '8',
        title: 'Phương trình bậc nhất một ẩn',
        subject: 'Toán',
        difficulty_level: 'Dễ',
        short_description: 'Giải và biểu diễn phương trình bậc nhất ax + b = 0 trên trục số. Tìm hiểu nghiệm và điều kiện có nghiệm.',
        learning_objectives: [
            'Hiểu khái niệm phương trình bậc nhất',
            'Biết cách giải phương trình ax + b = 0',
            'Biểu diễn nghiệm trên trục số',
            'Phân biệt các trường hợp vô nghiệm, một nghiệm, vô số nghiệm'
        ],
        tools_instructions: [
            'Trục số',
            'Thanh trượt điều chỉnh hệ số a, b',
            'Bảng tính toán',
            'Công cụ đánh dấu điểm'
        ],
        simulation_config: 'ax + b = 0\\nx = -b/a (khi a ≠ 0)',
        estimated_time: 25,
        thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        created_at: '2024-01-08'
    }
];

// Mock Achievements Data
export const mockAchievements: Achievement[] = [
    {
        id: '1',
        title: 'Nhà khoa học mới',
        description: 'Hoàn thành thí nghiệm đầu tiên',
        icon: '🔬',
        condition: 'complete_first_experiment'
    },
    {
        id: '2',
        title: 'Vật lý gia',
        description: 'Hoàn thành 3 thí nghiệm Vật lý',
        icon: '⚡',
        condition: 'complete_3_physics'
    },
    {
        id: '3',
        title: 'Nhà hóa học',
        description: 'Hoàn thành 3 thí nghiệm Hóa học',
        icon: '🧪',
        condition: 'complete_3_chemistry'
    },
    {
        id: '4',
        title: 'Nhà sinh học',
        description: 'Hoàn thành 3 thí nghiệm Sinh học',
        icon: '🧬',
        condition: 'complete_3_biology'
    },
    {
        id: '5',
        title: 'Siêu sao',
        description: 'Đạt điểm 100 trong một thí nghiệm',
        icon: '⭐',
        condition: 'perfect_score'
    }
];

// Helper functions
export function getExperimentById(id: string): Experiment | undefined {
    return mockExperiments.find(exp => exp.id === id);
}

export function getExperimentsBySubject(subject: string): Experiment[] {
    return mockExperiments.filter(exp => exp.subject === subject);
}

export function getExperimentsByDifficulty(difficulty: string): Experiment[] {
    return mockExperiments.filter(exp => exp.difficulty_level === difficulty);
}
