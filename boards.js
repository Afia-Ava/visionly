document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const boardSearch = document.getElementById('board-search');
  const sortSelect = document.getElementById('sort-boards');
  const filterTags = document.querySelectorAll('.tag-btn');
  const boardsGrid = document.querySelector('.boards-grid');

  // Search Functionality
  boardSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const boards = document.querySelectorAll('.board-card:not(.add-board)');
    
    boards.forEach(board => {
      const title = board.querySelector('h3').textContent.toLowerCase();
      board.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
  });

  // Sort Functionality
  sortSelect.addEventListener('change', (e) => {
    const boards = Array.from(document.querySelectorAll('.board-card:not(.add-board)'));
    const addBoard = document.querySelector('.add-board');
    
    boards.sort((a, b) => {
      const titleA = a.querySelector('h3').textContent;
      const titleB = b.querySelector('h3').textContent;
      const dateA = new Date(a.querySelector('.board-date').textContent.replace('Created: ', ''));
      const dateB = new Date(b.querySelector('.board-date').textContent.replace('Created: ', ''));
      
      switch(e.target.value) {
        case 'date-desc':
          return dateB - dateA;
        case 'date-asc':
          return dateA - dateB;
        case 'name-asc':
          return titleA.localeCompare(titleB);
        case 'name-desc':
          return titleB.localeCompare(titleA);
        default:
          return 0;
      }
    });
    
    // Clear and re-append sorted boards
    boardsGrid.innerHTML = '';
    boards.forEach(board => boardsGrid.appendChild(board));
    boardsGrid.appendChild(addBoard);
  });

  // Filter Tags
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      // Remove active class from all tags
      filterTags.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tag
      tag.classList.add('active');
      
      const filter = tag.textContent.toLowerCase();
      const boards = document.querySelectorAll('.board-card:not(.add-board)');
      
      if (filter === 'all') {
        boards.forEach(board => board.style.display = 'block');
      } else {
        boards.forEach(board => {
          // In a real implementation, you would check the board's category/tags
          // For now, we'll just simulate filtering
          const shouldShow = Math.random() > 0.5; // Simulated filter
          board.style.display = shouldShow ? 'block' : 'none';
        });
      }
    });
  });

  // Board Actions
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.textContent.trim().split(' ')[1].toLowerCase();
      const boardTitle = e.target.closest('.board-card').querySelector('h3').textContent;
      
      switch(action) {
        case 'edit':
          window.location.href = `create-board.html?edit=${encodeURIComponent(boardTitle)}`;
          break;
        case 'view':
          // Implement view functionality
          alert(`Viewing board: ${boardTitle}`);
          break;
        case 'share':
          // Implement share functionality
          alert(`Sharing board: ${boardTitle}`);
          break;
      }
    });
  });
}); 