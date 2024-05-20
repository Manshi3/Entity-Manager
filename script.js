document.getElementById('createEntityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const entityName = document.getElementById('entityName').value;
    const attributes = document.getElementById('attributes').value.split(',').map(attr => {
      const [name, type] = attr.trim().split(':');
      return { name, type };
    });
    
    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityName, attributes })
    });
    
    const result = await response.json();
    document.getElementById('responseOutput').textContent = JSON.stringify(result, null, 2);
  });

  async function loadEntities() {
    const response = await fetch('/api/entities');
    const entities = await response.json();
    const list = document.getElementById('entity-list');
    list.innerHTML = '';
    entities.forEach(entity => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = `/entity/${entity}`;
      link.textContent = entity;
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
  }

  function addAttributeInput() {
    const attributesDiv = document.getElementById('attributes');

    const attributeDiv = document.createElement('div');
    attributeDiv.className = 'attribute';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Attribute Name';
    nameInput.name = 'attributeName';

    const typeSelect = document.createElement('select');
    typeSelect.name = 'attributeType';

    const types = ['VARCHAR(255)', 'INT', 'FLOAT', 'DATE', 'BOOLEAN'];
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    attributeDiv.appendChild(nameInput);
    attributeDiv.appendChild(typeSelect);

    attributesDiv.appendChild(attributeDiv);
  }

  async function createEntity(event) {
    event.preventDefault();

    const entityName = document.getElementById('entityName').value;
    const attributeNames = document.getElementsByName('attributeName');
    const attributeTypes = document.getElementsByName('attributeType');

    const attributes = [];
    for (let i = 0; i < attributeNames.length; i++) {
      const name = attributeNames[i].value;
      const type = attributeTypes[i].value;
      if (name && type) {
        attributes.push({ name, type });
      }
    }

    if (attributes.length === 0) {
      alert('Please add at least one attribute and type pair.');
      return;
    }

    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entityName, attributes }),
    });

    if (response.ok) {
      alert('Entity created successfully');
      loadEntities(); // Reload the entities list
      document.getElementById('createEntityForm').reset(); // Reset the form
      document.getElementById('attributes').innerHTML = ''; // Clear attributes
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  }

  window.onload = function() {
    loadEntities();
    document.getElementById('addAttribute').addEventListener('click', addAttributeInput);
    document.getElementById('createEntityForm').addEventListener('submit', createEntity);
  };