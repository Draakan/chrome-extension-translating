let isTextSelected = false;

document.addEventListener('mouseup', () => {
  if (isTextSelected) {
    handleTextSelection();
  }

  isTextSelected = false;
});

document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection().toString().trim();

  isTextSelected = selectedText.length >= 2;
});

async function handleTextSelection() {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();

    await showPopup(selectedText, rect);
  }
}

async function showPopup(word, rect) {
  const existingPopup = document.querySelector('.custom-popup');

  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = createPopup(rect);

  popup.textContent = `Loading translation for: ${ word } ...`;

  document.body.appendChild(popup);

  try {
    const result = await getTranslates(word);

    if (result) {
      popup.textContent = `Translation for "${word}": ${result.translations[0].text}`;

      const addButton = createAddButton();

      addButton.onclick = () => popup.remove();

      popup.appendChild(addButton);
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

  popup.className = 'custom-popup';
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

function createAddButton() {
  const addButton = document.createElement('button');

  addButton.textContent = 'Add';
  addButton.style.backgroundColor = '#3498db';
  addButton.style.color = '#fff';
  addButton.style.border = 'none';
  addButton.style.padding = '-1px 10px';
  addButton.style.borderRadius = '20px';
  addButton.style.cursor = 'pointer';
  addButton.style.marginLeft = '7px';
  addButton.style.fontSize = '14px';

  return addButton;
}
