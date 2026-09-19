export class UI {
  constructor(questionCardEl, optionsGridEl, consoleEl, actionBtnEl, onOptionSelect) {
    this.questionCardEl = questionCardEl;
    this.optionsGridEl = optionsGridEl;
    this.consoleEl = consoleEl;
    this.actionBtnEl = actionBtnEl;
    this.onOptionSelect = onOptionSelect;
  }

  renderQuestion(question, progressText, selectedIndex, isValidated) {
    this.questionCardEl.innerHTML = `
      <div class="m3-photo-badge" style="margin-bottom: 10px;">${progressText}</div>
      <h2 class="m3-waste-title" style="font-size: 1.3rem; line-height: 1.4;">${question.text}</h2>
    `;

    this.optionsGridEl.innerHTML = "";
    
    question.options.forEach((optionText, index) => {
      const isSelected = selectedIndex === index;
      const isCorrect = isValidated && index === question.correctIndex;
      const isWrong = isValidated && isSelected && index !== question.correctIndex;
      
      const btn = document.createElement("button");
      btn.type = "button";
      
      let className = "m3-target-btn";
      if (isSelected) className += " selected";
      if (isCorrect) className += " correct";
      if (isWrong) className += " error";
      
      btn.className = className;
      btn.disabled = isValidated;
      
      if (isCorrect) {
        btn.style.backgroundColor = "#d4edda";
        btn.style.borderColor = "#28a745";
      } else if (isWrong) {
        btn.style.backgroundColor = "#f8d7da";
        btn.style.borderColor = "#dc3545";
      }

      btn.innerHTML = `<span class="m3-target-name">${optionText}</span>`;
      btn.addEventListener("click", () => this.onOptionSelect(index));
      this.optionsGridEl.appendChild(btn);
    });

    if (!isValidated) {
      this.consoleEl.classList.add("hidden");
      this.actionBtnEl.textContent = "Valider";
      this.actionBtnEl.disabled = selectedIndex === null;
      this.actionBtnEl.style.opacity = selectedIndex === null ? "0.5" : "1";
    }
  }

  renderFeedback(isCorrect, explanation) {
    let html = `<div class="m3-feedback-content">`;
    if (isCorrect) {
      html += `<h4 class="m3-success" style="color: #28a745;">✅ Bonne réponse !</h4>`;
    } else {
      html += `<h4 class="m3-error" style="color: #dc3545;">❌ Mauvaise réponse</h4>`;
    }
    html += `<p style="margin-top: 10px; line-height: 1.5;">${explanation}</p>`;
    html += `</div>`;
    
    this.consoleEl.innerHTML = html;
    this.consoleEl.classList.remove("hidden");
  }

  renderEndScreen(score, total) {
    this.questionCardEl.innerHTML = `
      <h2 class="m3-waste-title">Analyse terminée !</h2>
      <p class="m3-waste-desc">La base de données d'ECO-IA a été mise à jour.</p>
    `;
    this.optionsGridEl.innerHTML = "";
    
    const percentage = Math.round((score / total) * 100);
    let message = percentage >= 80 
      ? "L'IA vous remercie pour cette expertise parfaite." 
      : "L'IA a enregistré vos retours, continuez vos efforts pour affiner son modèle !";

    this.consoleEl.innerHTML = `
      <div class="m3-feedback-content" style="text-align: center;">
        <h3 style="font-size: 2rem; margin-bottom: 10px;">Score : ${score} / ${total}</h3>
        <p>${message}</p>
      </div>
    `;
    this.consoleEl.classList.remove("hidden");
  }
}