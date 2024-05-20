async function loadEntityData(entityName) {
  document.getElementById('entity-title').textContent = `Manage Entity: ${entityName}`;

  try {
    const response = await fetch(`/api/entities/${entityName}`);
    if (!response.ok) throw new Error('Failed to fetch entity data');
    const data = await response.json();

    const table = document.getElementById('entity-table');
    table.innerHTML = '';

    if (data.length === 0) {
      table.innerHTML = '<tr><td>No data available</td></tr>';
      return;
    }

    // Add table headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add table rows
    data.forEach(record => {
      const row = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = record[header];
        row.appendChild(td);
      });
      const actionTd = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        await deleteRecord(entityName, record.id);
      });
      actionTd.appendChild(deleteButton);
      row.appendChild(actionTd);
      table.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading entity data:', error);
  }
}

async function loadEntityAttributes(entityName) {
  try {
    const response = await fetch(`/api/entities/${entityName}/attributes`);
    if (!response.ok) throw new Error('Failed to fetch entity attributes');
    const attributes = await response.json();

    const addForm = document.getElementById('add-form');
    const updateForm = document.getElementById('update-form');
    addForm.innerHTML = '';
    updateForm.innerHTML = '<input type="text" name="id" placeholder="Enter ID to update"><br>';

    attributes.forEach(attr => {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = attr.name;
      input.name = attr.name;

      addForm.appendChild(input);
      addForm.appendChild(document.createElement('br'));

      const updateInput = input.cloneNode(true);
      updateForm.appendChild(updateInput);
      updateForm.appendChild(document.createElement('br'));
    });

    const addSubmitButton = document.createElement('button');
    addSubmitButton.textContent = 'Add Record';
    addForm.appendChild(addSubmitButton);

    const updateSubmitButton = document.createElement('button');
    updateSubmitButton.textContent = 'Update Record';
    updateForm.appendChild(updateSubmitButton);
  } catch (error) {
    console.error('Error loading entity attributes:', error);
  }
}

async function addRecord(entityName, formData) {
  try {
    const response = await fetch(`/api/entities/${entityName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    alert('Record added successfully');
    loadEntityData(entityName);
  } catch (error) {
    console.error('Error adding record:', error);
    alert('Error adding record: ' + error.message);
  }
}

async function deleteRecord(entityName, recordId) {
  try {
    const response = await fetch(`/api/entities/${entityName}/${recordId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    alert('Record deleted successfully');
    loadEntityData(entityName);
  } catch (error) {
    console.error('Error deleting record:', error);
    alert('Error deleting record: ' + error.message);
  }
}

async function updateRecord(entityName, recordId, formData) {
  const updates = {};
  for (const [key, value] of Object.entries(formData)) {
    if (value.trim()) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    alert('No fields to update');
    return;
  }

  try {
    const response = await fetch(`/api/entities/${entityName}/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    alert('Record updated successfully');
    loadEntityData(entityName);
  } catch (error) {
    console.error('Error updating record:', error);
    alert('Error updating record: ' + error.message);
  }
}

function goToHomePage() {
  window.location.href = '/';
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const entityName = urlParams.get('entity');
  if (!entityName) {
    console.error('Entity name not found in URL');
    window.alert(1);
    return;
  }

  loadEntityData(entityName);
  loadEntityAttributes(entityName);

  const addForm = document.getElementById('add-form');
  addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    await addRecord(entityName, data);
  });

  const updateForm = document.getElementById('update-form');
  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(updateForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    const recordId = data.id;
    delete data.id;
    await updateRecord(entityName, recordId, data);
  });
};
