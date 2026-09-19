export class GameState {
  constructor(questions) {
    this.questions = questions;
    this.currentIndex = 0;
    this.score = 0;
    this.selectedOptionIndex = null;
    this.isValidated = false;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  getProgressText() {
    return `Question ${this.currentIndex + 1} / ${this.questions.length}`;
  }

  selectOption(index) {
    if (this.isValidated) return;
    this.selectedOptionIndex = index;
  }

  validate() {
    if (this.selectedOptionIndex === null || this.isValidated) return false;
    
    this.isValidated = true;
    const isCorrect = this.selectedOptionIndex === this.getCurrentQuestion().correctIndex;
    
    if (isCorrect) {
      this.score++;
    }
    
    return isCorrect;
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.selectedOptionIndex = null;
      this.isValidated = false;
      return true;
    }
    return false;
  }

  isFinished() {
    return this.currentIndex === this.questions.length - 1 && this.isValidated;
  }
}