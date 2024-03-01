// Retrieve tasks and nextId from localStorage

// The pre-given variables were not needed for the task board to function. Hence commented out.

// let taskList = JSON.parse(localStorage.getItem("tasks"));
// let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return crypto.randomUUID()
}

// Todo: create a function to create a task card
function createTaskCard(task) {

    // Create elements and assign appropriate classes for bootstrap styling
    const taskCard = $('<div>')
    taskCard.addClass('card draggable mb-2')
    taskCard.attr('data-task-id', task.uniqTaskId)

    const taskCardHeader = $('<div>')
    taskCardHeader.addClass('card-header h4')
    taskCardHeader.text(task.taskTitle)

    const taskCardBody = $('<div>')
    taskCardBody.addClass('card-body')
    const taskCardText = $('<p>')
    taskCardText.addClass('card-text')
    taskCardText.text(task.taskDescription)

    const taskCardDueDate = $('<P>')
    taskCardDueDate.addClass('card-text')
    taskCardDueDate.text(task.taskDueDate)

    const taskCardDeleteBtn = $('<button>')
    taskCardDeleteBtn.addClass('btn btn-danger delete')
    taskCardDeleteBtn.text('Delete')
    taskCardDeleteBtn.attr('data-task-id', task.uniqTaskId)
    taskCardDeleteBtn.attr('id', 'delete')

    // this if statements determines whether to make the card background color red or yellow based on due date and current date.
    if (task.taskDueDate && task.status !== 'done') {
        const now = dayjs();
        const dueDate = dayjs(task.taskDueDate, 'MM/DD/YYYY');

        if (now.isSame(dueDate, 'day')) {
            taskCard.addClass('bg-warning text-white')
        } else if (now.isAfter(dueDate)) {
            taskCard.addClass('bg-danger text-white')
            taskCardDeleteBtn.addClass('border-light')
        }
    }

    // these append functions properly places the newly created element in correct places for display.
    taskCard.append(taskCardHeader)
    taskCard.append(taskCardBody)
    taskCardBody.append(taskCardText)
    taskCardBody.append(taskCardDueDate)
    taskCardBody.append(taskCardDeleteBtn)

    // This "todo" status only applies to new cards. renderTaskList() function uses createTaskCard but it also updates the status before it finishes its function.
    const taskToDoCards = $('#todo-cards')
    taskToDoCards.append(taskCard)
    

    return taskCard
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const savedTasks = loadFromStorage()

    // below three variables clear all cards at the start so that it can be displayed again based on correct status.
    const toDoList = $('#todo-cards');
    toDoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    // this renders each card with correct status based on data from localStorage.
    for (let task of savedTasks) {
        const eachCard = createTaskCard(task)
        if (task.status ==='to-do') {
            toDoList.append(eachCard)
        } else if (task.status === 'in-progress') {
            inProgressList.append(eachCard)
        } else {
            doneList.append(eachCard)
        }
        
    }

    // This draggable function was copied from the mini project as it has the visual effects for dragging work properly.
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
            // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
            const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
            // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });

  
    
}

// Created a new function for loading from the localStorage in order to get the object data in localStorage as arrays.
function loadFromStorage() {
    let savedDatas = localStorage.getItem('tasks')
    if (savedDatas === null ) {
        savedDatas = []
        return savedDatas
    } else {
        savedDatas = JSON.parse(localStorage.getItem('tasks'))
        return savedDatas
    }
}



// Todo: create a function to handle adding a new task
function handleAddTask(event){

    // When add task button from the main page is clicked, variables are set to point to the input locations
    // Unique id generation was done as a separate function.
    const taskTitle = $('#task-title')
    const taskDue = $('#task-due-date')
    const taskDesc = $('#task-description')
    const uniqueID = generateTaskId()

    // This creates a new oject with the given input values from the modal.
    const newTask = {
        uniqTaskId: uniqueID,
        taskTitle: taskTitle.val(),
        taskDueDate: taskDue.val(),
        taskDescription: taskDesc.val(), 
        status: 'to-do'
    }

    // This brings the existing localStorage data and adds the new task into the array of objects.
    const savedTasks = loadFromStorage()
    savedTasks.push(newTask)
    
    // Then saves to localStorage, create a new card, renders the task cards onto the page and clears out the input areas in modal
    localStorage.setItem('tasks', JSON.stringify(savedTasks))

    createTaskCard(newTask)

    renderTaskList()

    taskTitle.val('')
    taskDue.val('')
    taskDesc.val('')
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){

    // The variables below grabs the unique id's for the card grabbed and all unique id's from array of objects
    const cardId = $(this).attr('data-task-id')
    const savedTasks = loadFromStorage()

    // this for loop checks for the matching id and removes that whole object from the array. If it doesn't match, it doesn't do anything.
    for (let task in savedTasks) {
        if(savedTasks[task].uniqTaskId===cardId) {
            savedTasks.splice(task,1)
        }
    }

    // Save to localStorage after update and re-render.
    localStorage.setItem('tasks', JSON.stringify(savedTasks))

    renderTaskList()
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    // This loads the stored array of objects from localStorage.
    const savedTasks = loadFromStorage();

    // This grabs the taskId of the card that I clicked and holding on to. ui.draggable gives data about the card and it's attributes.
    // We're accessing the grabbed card's custom data attribute by going into dataset and grabbing the property "taskId"
    const taskIdentifier = ui.draggable[0].dataset.taskId;

    // This identifies the mouse's location and which "lane" it is on by getting the id of the section (todo / in progress / done)
    const newStatus = event.target.id;

    // This loop identifies if the card i clicked and is dragging on matches unique ID from the array of objects from localStorage and updates the object property status to the new location's id which is the status.
    for (let task of savedTasks) {
        if (task.uniqTaskId === taskIdentifier) {
            task.status = newStatus
        }
    }

    // new array is saved to localStorage with the card's new status and page is reloaded again with the new cards' locations.
    localStorage.setItem('tasks', JSON.stringify(savedTasks))
    renderTaskList()

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList()
    
    // added the datepicker jquery UI. Used input type 'text' so that only jquery ui would apply.
    $('#task-due-date').datepicker({
        changeMonth: true,
        changeYear: true
    });
    
    // event listener that performs a function when "add task" button in the modal is clicked.
    // addTaskBtn.addEventListener('click',handleAddTask)
    $('#formModal').on('click', '#addTaskBtn', handleAddTask)

    $('#task-table').on('click', '#delete', handleDeleteTask)
    // deleteBtn.addEventListener('click', handleDeleteTask)
    // made the To Do / In Progress/ Done columns to be able to accept dragged and dropped cards.
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });
});
