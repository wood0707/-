// 플래시카드 앱 메인 로직
class FlashcardApp {
    constructor() {
        this.currentWords = [];
        this.currentIndex = 0;
        this.score = 0;
        this.correctCount = 0;
        this.wrongAnswers = [];
        this.isAnswered = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
    }

    // DOM 요소 초기화
    initializeElements() {
        try {
            // 화면 요소
            this.startScreen = document.getElementById('startScreen');
            this.studyScreen = document.getElementById('studyScreen');
            this.resultScreen = document.getElementById('resultScreen');
            this.scoreHistoryScreen = document.getElementById('scoreHistoryScreen');

            // 시작 화면 요소
            this.totalWordsEl = document.getElementById('totalWords');
            this.avgScoreEl = document.getElementById('avgScore');
            this.startBtn = document.getElementById('startBtn');

            // 학습 화면 요소
            this.currentProgressEl = document.getElementById('currentProgress');
            this.currentScoreEl = document.getElementById('currentScore');
            this.progressFillEl = document.getElementById('progressFill');
            this.flashcard = document.getElementById('flashcard');
            this.wordText = document.getElementById('wordText');
            this.meaningText = document.getElementById('meaningText');
            this.resultIcon = document.getElementById('resultIcon');
            this.choicesContainer = document.getElementById('choicesContainer');
            this.nextContainer = document.getElementById('nextContainer');
            this.nextBtn = document.getElementById('nextBtn');

            // 선택지 버튼
            this.choiceBtns = document.querySelectorAll('.choice-btn');

            // 결과 화면 요소
            this.finalScoreEl = document.getElementById('finalScore');
            this.correctCountEl = document.getElementById('correctCount');
            this.incorrectCountEl = document.getElementById('incorrectCount');
            this.restartBtn = document.getElementById('restartBtn');
            this.backToStartBtn = document.getElementById('backToStartBtn');

            // 점수 기록 화면 요소
            this.scoreHistoryBtn = document.getElementById('scoreHistoryBtn');
            this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
            this.scoreHistoryList = document.getElementById('scoreHistoryList');

            // Dimming overlay 요소
            this.dimmingOverlay = document.getElementById('dimmingOverlay');

            console.log('DOM 요소 초기화 완료');
            console.log('startBtn:', this.startBtn);
        } catch (error) {
            console.error('DOM 요소 초기화 실패:', error);
        }
    }

    // 이벤트 바인딩
    bindEvents() {
        try {
            if (this.startBtn) {
                this.startBtn.addEventListener('click', () => this.startStudy());
                console.log('startBtn 이벤트 바인딩 성공');
            } else {
                console.error('startBtn을 찾을 수 없습니다');
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.nextWord());
            }

            if (this.restartBtn) {
                this.restartBtn.addEventListener('click', () => this.startStudy());
            }

            if (this.backToStartBtn) {
                this.backToStartBtn.addEventListener('click', () => this.showStartScreen());
            }

            if (this.scoreHistoryBtn) {
                this.scoreHistoryBtn.addEventListener('click', () => this.showScoreHistory());
            }

            if (this.closeHistoryBtn) {
                this.closeHistoryBtn.addEventListener('click', () => this.hideScoreHistory());
            }

            // 선택지 버튼 이벤트
            if (this.choiceBtns && this.choiceBtns.length > 0) {
                this.choiceBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => this.selectChoice(e.target));
                });
            }

            // 플래시카드 클릭 이벤트
            if (this.flashcard) {
                this.flashcard.addEventListener('click', () => this.flipCard());
            }
        } catch (error) {
            console.error('이벤트 바인딩 실패:', error);
        }
    }

    // 초기 데이터 로드
    async loadInitialData() {
        // 단어 데이터 로드 대기
        if (window.wordManager) {
            await window.wordManager.loadWords();
            this.updateStartScreenInfo();
        }
    }

    // 시작 화면 정보 업데이트
    updateStartScreenInfo() {
        try {
            console.log('시작 화면 정보 업데이트');
            if (this.totalWordsEl && window.wordManager) {
                this.totalWordsEl.textContent = window.wordManager.getTotalWordsCount();
                console.log('총 단어 수:', window.wordManager.getTotalWordsCount());
            }
            if (this.avgScoreEl && window.scoreManager) {
                this.avgScoreEl.textContent = window.scoreManager.getAverageScore();
                console.log('평균 점수:', window.scoreManager.getAverageScore());
            }
        } catch (error) {
            console.error('시작 화면 정보 업데이트 실패:', error);
        }
    }

    // 학습 시작
    async startStudy() {
        try {
            console.log('학습 시작 버튼 클릭됨');
            
            if (!window.wordManager) {
                alert('단어 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                return;
            }

            this.currentWords = window.wordManager.selectStudyWords();
            
            if (this.currentWords.length === 0) {
                alert('학습할 단어가 없습니다.');
                return;
            }

            this.currentIndex = 0;
            this.score = 0;
            this.correctCount = 0;
            this.wrongAnswers = [];
            this.isAnswered = false;

            console.log('학습 화면으로 전환');
            this.showStudyScreen();
            this.showCurrentWord();
        } catch (error) {
            console.error('학습 시작 실패:', error);
            alert('학습을 시작할 수 없습니다. 페이지를 새로고침해주세요.');
        }
    }

    // 현재 단어 표시 (개선된 버전)
    showCurrentWord() {
        if (this.currentIndex >= this.currentWords.length) {
            this.showResult();
            return;
        }

        const currentWord = this.currentWords[this.currentIndex];
        this.isAnswered = false;

        // UI 업데이트
        this.currentProgressEl.textContent = this.currentIndex + 1;
        this.currentScoreEl.textContent = this.score;
        this.wordText.textContent = currentWord.word;
        this.meaningText.textContent = currentWord.meaning;

        // 진행률 바 업데이트
        const progress = ((this.currentIndex + 1) / this.currentWords.length) * 100;
        this.progressFillEl.style.width = `${progress}%`;

        // 선택지 버튼 초기화
        this.choiceBtns.forEach(btn => {
            btn.classList.remove('highlight-correct', 'highlight-incorrect', 'correct', 'incorrect');
        });

        // Dimming overlay 숨기기
        this.hideDimmingOverlay();

        // 선택지 생성
        this.generateChoices(currentWord);

        // 다음 버튼 숨기기 (선택지가 바로 보임)
        this.nextContainer.style.display = 'none';
    }

    // 선택지 생성 (개선된 버전)
    generateChoices(currentWord) {
        const correctMeaning = currentWord.meaning;
        const otherWords = this.currentWords.filter(w => w.id !== currentWord.id);
        
        // 랜덤으로 3개의 다른 의미 선택 (개선된 랜덤 선택)
        const selectedMeanings = [];
        const availableWords = [...otherWords];
        
        // Fisher-Yates shuffle algorithm
        for (let i = availableWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
        }
        
        // 3개의 랜덤한 다른 의미 선택
        for (let i = 0; i < Math.min(3, availableWords.length); i++) {
            selectedMeanings.push(availableWords[i].meaning);
        }

        // 정답 추가하고 섞기 (Fisher-Yates shuffle)
        const allChoices = [correctMeaning, ...selectedMeanings];
        for (let i = allChoices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
        }

        console.log('선택지 생성:', currentWord.word, allChoices); // 디버깅용

        // 선택지 버튼 업데이트
        this.choiceBtns.forEach((btn, index) => {
            if (index < allChoices.length) {
                btn.textContent = allChoices[index];
                btn.dataset.choice = allChoices[index];
                btn.style.display = 'block';
                btn.classList.remove('correct', 'incorrect', 'highlight-correct', 'highlight-incorrect');
                btn.disabled = false;
            } else {
                btn.style.display = 'none';
            }
        });
    }

    // 선택지 선택
    selectChoice(btn) {
        if (this.isAnswered) return;

        this.isAnswered = true;
        const currentWord = this.currentWords[this.currentIndex];
        const selectedMeaning = btn.dataset.choice;
        const isCorrect = selectedMeaning === currentWord.meaning;

        // Dimming overlay 활성화
        this.showDimmingOverlay();

        // 버튼 상태 업데이트
        this.choiceBtns.forEach(b => {
            b.disabled = true;
            if (b.dataset.choice === currentWord.meaning) {
                b.classList.add('correct');
                b.classList.add('highlight-correct');
            }
        });

        if (isCorrect) {
            // 정답 효과
            btn.classList.add('correct');
            btn.classList.add('highlight-correct');
            this.flashcard.classList.add('correct-effect');
            this.score++;
            this.correctCount++;
            this.showResultIcon(true);
        } else {
            // 오답 효과
            btn.classList.add('incorrect');
            btn.classList.add('highlight-incorrect');
            this.flashcard.classList.add('incorrect-effect');
            this.wrongAnswers.push({
                word: currentWord.word,
                correctMeaning: currentWord.meaning,
                selectedMeaning: selectedMeaning
            });
            this.showResultIcon(false);
        }

        // 점수 업데이트
        this.currentScoreEl.textContent = this.score;

        // 다음 버튼 표시 (지연 증가)
        setTimeout(() => {
            this.nextContainer.style.display = 'block';
        }, 1500);

        // 3초 후 자동으로 다음 단어로 진행
        setTimeout(() => {
            if (this.currentIndex < this.currentWords.length - 1) {
                this.nextWord();
            } else {
                // 마지막 단어인 경우 결과 화면으로
                this.showResult();
            }
        }, 3000);
    }

    // 결과 아이콘 표시
    showResultIcon(isCorrect) {
        this.resultIcon.className = 'result-icon';
        this.resultIcon.classList.add(isCorrect ? 'correct' : 'incorrect');
        this.resultIcon.innerHTML = isCorrect ? 
            '<i class="fas fa-check-circle"></i>' : 
            '<i class="fas fa-times-circle"></i>';
    }

    // Dimming overlay 표시
    showDimmingOverlay() {
        this.dimmingOverlay.classList.add('active');
    }

    // Dimming overlay 숨기기
    hideDimmingOverlay() {
        this.dimmingOverlay.classList.remove('active');
    }

    // 플래시카드 뒤집기
    flipCard() {
        if (!this.isAnswered) return;
        this.flashcard.classList.toggle('flipped');
    }

    // 다음 단어
    nextWord() {
        // 효과 초기화
        this.flashcard.classList.remove('correct-effect', 'incorrect-effect');
        this.choiceBtns.forEach(btn => {
            btn.classList.remove('highlight-correct', 'highlight-incorrect');
        });
        this.hideDimmingOverlay();
        
        this.currentIndex++;
        this.showCurrentWord();
    }

    // 결과 화면 표시
    showResult() {
        this.showResultScreen();
        this.finalScoreEl.textContent = this.score;
        this.correctCountEl.textContent = this.correctCount;
        this.incorrectCountEl.textContent = this.currentWords.length - this.correctCount;

        // 점수 저장
        if (window.scoreManager) {
            window.scoreManager.saveScore(this.score, this.correctCount, this.currentWords.length);
        }
    }

    // 점수 기록 표시
    async showScoreHistory() {
        if (window.scoreManager) {
            await window.scoreManager.loadScores();
            const scores = window.scoreManager.getRecentScores();
            this.renderScoreHistory(scores);
        }
        this.scoreHistoryScreen.classList.add('active');
    }

    // 점수 기록 렌더링
    renderScoreHistory(scores) {
        if (scores.length === 0) {
            this.scoreHistoryList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>아직 기록이 없습니다.</p>
                </div>
            `;
            return;
        }

        const historyHTML = scores.map(score => {
            const date = new Date(score.study_date);
            const dateStr = date.toLocaleDateString('ko-KR');
            const timeStr = date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return `
                <div class="score-history-item">
                    <div class="score-info">
                        <div class="score-number">${score.score}</div>
                        <div>
                            <div class="score-date">${dateStr} ${timeStr}</div>
                            <div class="score-details">
                                정답: ${score.correct_count}/${score.total_questions}
                            </div>
                        </div>
                    </div>
                    <div class="score-accuracy">
                        ${Math.round((score.correct_count / score.total_questions) * 100)}%
                    </div>
                </div>
            `;
        }).join('');

        this.scoreHistoryList.innerHTML = historyHTML;
    }

    // 점수 기록 숨기기
    hideScoreHistory() {
        this.scoreHistoryScreen.classList.remove('active');
    }

    // 화면 전환 메서드들
    showStartScreen() {
        this.hideAllScreens();
        this.startScreen.classList.add('active');
        this.updateStartScreenInfo();
    }

    showStudyScreen() {
        this.hideAllScreens();
        this.studyScreen.classList.add('active');
    }

    showResultScreen() {
        this.hideAllScreens();
        this.resultScreen.classList.add('active');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded 이벤트 발생');
    
    // 데이터 매니저가 준비되었는지 확인
    const checkAndInit = () => {
        if (window.wordManager && window.scoreManager) {
            console.log('데이터 매니저 준비됨');
            window.flashcardApp = new FlashcardApp();
        } else {
            console.log('데이터 매니저 준비되지 않음, 재시도...');
            setTimeout(checkAndInit, 100);
        }
    };
    
    checkAndInit();
});

// 백업 초기화 (DOMContentLoaded가 늦게 발생하는 경우)
window.addEventListener('load', () => {
    if (!window.flashcardApp) {
        console.log('window.load: 백업 초기화 시도');
        window.flashcardApp = new FlashcardApp();
    }
});