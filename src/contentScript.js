let isTextSelected = false;

document.addEventListener('mouseup', () => {
  if (isTextSelected) {
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();

    showTranslateButton(rect);
  }

  isTextSelected = false;
});

document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection().toString().trim();

  isTextSelected = selectedText.length >= 2;
});

function showTranslateButton(rect) {
  const existingPopup = document.querySelector('.translate-button');

  if (existingPopup) {
    existingPopup.remove();
  }

  const translateBtnPopup = createPopup(rect);

  translateBtnPopup.className = 'translate-button';

  document.body.appendChild(translateBtnPopup);

  const translateBtn = createButton('Translate');

  translateBtn.onclick = () => {
    handleTextSelection(rect);

    translateBtnPopup.remove();
  };

  translateBtnPopup.appendChild(translateBtn);

  setTimeout(() => {
    document.addEventListener('click', onClickOutsideTranslate = (event) => {
      if (!translateBtnPopup.contains(event.target)) {
        translateBtnPopup.remove();

        document.removeEventListener('click', onClickOutsideTranslate);
      }
    });
  }, 100);
}

async function handleTextSelection(rect) {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    showPopup(selectedText, rect);
  }
}

async function showPopup(word, rect) {
  const existingPopup = document.querySelector('.custom-popup');

  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = createPopup(rect);

  popup.className = 'custom-popup';
  popup.textContent = `Loading translation for: ${ word } ...`;

  document.body.appendChild(popup);

  try {
    const result = await getTranslates(word);

    if (result) {
      popup.textContent = `Translation for "${word}": ${result.translations[0].text}`;

      const addButton = createButton('Add');
      const closeButton = createButton('Close');

      addButton.style.marginLeft = '7px';
      closeButton.style.marginLeft = '7px';

      addButton.onclick = () => popup.remove();
      closeButton.onclick = () => popup.remove();

      popup.appendChild(addButton);
      popup.appendChild(closeButton);
    } else {
      popup.textContent = `No translation found for "${word}".`;
    }
  } catch (error) {
    console.log(error)
    popup.textContent = `Error fetching translation.`;
  }

  document.addEventListener('click', onClickOutside = (event) => {
    if (!popup.contains(event.target)) {
      popup.remove();

      document.removeEventListener('click', onClickOutside);
    }
  });
}

async function getTranslates(word) {
  try {
    const result = await fetch(import.meta.env.VITE_DEEPL_API_LAMBDA_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: word,
      }),
    });

    return await result.json()
  } catch(error) {
    console.log(error);
  }
}

function createPopup(rect) {
  const popup = document.createElement('div');

  popup.style.position = 'absolute';
  popup.style.background = '#fff';
  popup.style.border = '1px solid #ccc';
  popup.style.padding = '5px';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.1)';
  popup.style.zIndex = 10000;
  popup.style.fontSize = '14px';
  popup.style.fontFamily = 'sans-serif';
  popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 45}px`;
  popup.style.left = `${rect.left - window.scrollX}px`;

  return popup;
}

function createButton(textContent) {
  const addButton = document.createElement('button');

  addButton.textContent = textContent;
  addButton.style.backgroundColor = '#3498db';
  addButton.style.color = '#fff';
  addButton.style.border = 'none';
  addButton.style.padding = '-1px 10px';
  addButton.style.borderRadius = '20px';
  addButton.style.cursor = 'pointer';
  addButton.style.fontSize = '14px';

  return addButton;
}
