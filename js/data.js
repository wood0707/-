// 단어 데이터 관리
class WordManager {
    constructor() {
        this.words = [];
        this.currentStudyWords = [];
        this.loadWords();
    }

    // 단어 데이터 로드
    async loadWords() {
        try {
            const response = await fetch('tables/words');
            const data = await response.json();
            this.words = data.data;
            console.log('단어 데이터 로드 완료:', this.words.length, '개');
        } catch (error) {
            console.error('단어 데이터 로드 실패:', error);
            // 백업 데이터 사용
            this.words = this.getBackupWords();
        }
    }

    // 백업 단어 데이터
    getBackupWords() {
        return [
            { id: '1', word: 'abundant', meaning: '풍부한, 많은', difficulty: 'easy' },
            { id: '2', word: 'benevolent', meaning: '자애로운, 인자한', difficulty: 'medium' },
            { id: '3', word: 'curiosity', meaning: '호기심', difficulty: 'easy' },
            { id: '4', word: 'diligent', meaning: '근면한, 부지런한', difficulty: 'medium' },
            { id: '5', word: 'eloquent', meaning: '유창한, 설득력 있는', difficulty: 'hard' },
            { id: '6', word: 'fragile', meaning: '깨지기 쉬운, 연약한', difficulty: 'easy' },
            { id: '7', word: 'gracious', meaning: '우아한, 친절한', difficulty: 'medium' },
            { id: '8', word: 'harmony', meaning: '조화, 화합', difficulty: 'easy' },
            { id: '9', word: 'innovative', meaning: '혁신적인', difficulty: 'hard' },
            { id: '10', word: 'jubilant', meaning: '활기차게 기뻐하는', difficulty: 'hard' },
            { id: '11', word: 'knowledge', meaning: '지식', difficulty: 'easy' },
            { id: '12', word: 'luminous', meaning: '빛나는, 밝은', difficulty: 'medium' },
            { id: '13', word: 'magnificent', meaning: '웅장한, 훌륭한', difficulty: 'hard' },
            { id: '14', word: 'nurture', meaning: '양육하다, 기르다', difficulty: 'medium' },
            { id: '15', word: 'optimistic', meaning: '낙관적인', difficulty: 'easy' },
            { id: '16', word: 'persistent', meaning: '끈기 있는, 고집스러운', difficulty: 'medium' },
            { id: '17', word: 'quest', meaning: '탐구, 탐색', difficulty: 'hard' },
            { id: '18', word: 'resilient', meaning: '회복력 있는', difficulty: 'hard' },
            { id: '19', word: 'serene', meaning: '고요한, 평온한', difficulty: 'medium' },
            { id: '20', word: 'thrive', meaning: '번창하다, 잘 자라다', difficulty: 'medium' }
        ];
    }

    // 학습할 단어 선택 (랜덤으로 10개)
    selectStudyWords() {
        if (this.words.length < 10) {
            console.warn('단어 수가 부족합니다. 전체 단어를 사용합니다.');
            this.currentStudyWords = [...this.words];
        } else {
            // 랜덤으로 10개 선택
            const shuffled = [...this.words].sort(() => Math.random() - 0.5);
            this.currentStudyWords = shuffled.slice(0, 10);
        }
        console.log('학습 단어 선택됨:', this.currentStudyWords.length, '개');
        return this.currentStudyWords;
    }

    // 현재 학습 단어 가져오기
    getCurrentStudyWords() {
        return this.currentStudyWords;
    }

    // 전체 단어 수
    getTotalWordsCount() {
        return this.words.length;
    }

    // 특정 난이도의 단어 가져오기
    getWordsByDifficulty(difficulty) {
        return this.words.filter(word => word.difficulty === difficulty);
    }
}

// 점수 관리
class ScoreManager {
    constructor() {
        this.scores = [];
        this.loadScores();
    }

    // 점수 데이터 로드
    async loadScores() {
        try {
            const response = await fetch('tables/scores');
            const data = await response.json();
            this.scores = data.data.sort((a, b) => b.study_date - a.study_date);
            console.log('점수 데이터 로드 완료:', this.scores.length, '개');
        } catch (error) {
            console.error('점수 데이터 로드 실패:', error);
            this.scores = [];
        }
    }

    // 점수 저장
    async saveScore(score, correctCount, totalQuestions = 10) {
        const scoreData = {
            score: score,
            correct_count: correctCount,
            total_questions: totalQuestions,
            study_date: Date.now()
        };

        try {
            const response = await fetch('tables/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.scores.unshift(result);
                console.log('점수 저장 성공:', result);
                return result;
            }
        } catch (error) {
            console.error('점수 저장 실패:', error);
            // 로컬 스토리지에 백업 저장
            this.saveToLocalStorage(scoreData);
            return scoreData;
        }
    }

    // 로컬 스토리지에 백업 저장
    saveToLocalStorage(scoreData) {
        const localScores = JSON.parse(localStorage.getItem('vocab_scores') || '[]');
        localScores.push(scoreData);
        localStorage.setItem('vocab_scores', JSON.stringify(localScores));
    }

    // 평균 점수 계산
    getAverageScore() {
        if (this.scores.length === 0) return 0;
        const total = this.scores.reduce((sum, score) => sum + score.score, 0);
        return Math.round(total / this.scores.length);
    }

    // 최근 점수 기록 가져오기
    getRecentScores(limit = 10) {
        return this.scores.slice(0, limit);
    }

    // 전체 점수 기록
    getAllScores() {
        return this.scores;
    }
}

// 전역 변수로 내보내기 (로딩 확인)
window.wordManager = new WordManager();
window.scoreManager = new ScoreManager();

console.log('데이터 매니저 초기화 완료');