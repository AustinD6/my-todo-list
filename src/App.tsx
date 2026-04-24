import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Tag, SortAsc, AlertCircle, Search, Edit3, X, Check } from 'lucide-react';
import './App.css';

type Priority = 'low' | 'medium' | 'high';
type Category = '工作' | '个人' | '购物' | '健康' | '其他';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate: string;
  createdAt: number;
}

const CATEGORIES: Category[] = ['工作', '个人', '购物', '健康', '其他'];

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('todo-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputText, setInputText] = useState('');
  const [inputPriority, setInputPriority] = useState<Priority>('medium');
  const [inputCategory, setInputCategory] = useState<Category>('工作');
  const [inputDueDate, setInputDueDate] = useState('');

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputText.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText,
      completed: false,
      priority: inputPriority,
      category: inputCategory,
      dueDate: inputDueDate || new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setInputText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editText } : t));
    setEditingId(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filterStatus === 'active') return !t.completed;
        if (filterStatus === 'completed') return t.completed;
        return true;
      })
      .filter(t => filterCategory === 'all' ? true : t.category === filterCategory)
      .filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filterStatus, filterCategory, sortBy, searchTerm]);

  const priorityColor = (p: Priority) => {
    switch (p) {
      case 'high': return '#ff4d4d';
      case 'medium': return '#ffa500';
      case 'low': return '#4caf50';
    }
  };

  return (
    <div className="glass-container">
      <header>
        <h1>My Tasks</h1>
        <p className="subtitle">高效工作，享受生活</p>
      </header>

      <div className="input-section">
        <div className="input-row">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="添加一个新任务..."
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button className="add-btn" onClick={addTask}>
            <Plus size={24} />
          </button>
        </div>
        
        <div className="options-row">
          <div className="option-item">
            <Tag size={16} />
            <select value={inputCategory} onChange={(e) => setInputCategory(e.target.value as Category)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="option-item">
            <AlertCircle size={16} />
            <select value={inputPriority} onChange={(e) => setInputPriority(e.target.value as Priority)}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div className="option-item">
            <Calendar size={16} />
            <input type="date" value={inputDueDate} onChange={(e) => setInputDueDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="搜索任务关键词..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && <X size={16} className="clear-search" onClick={() => setSearchTerm('')} />}
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>全部</button>
          <button className={filterStatus === 'active' ? 'active' : ''} onClick={() => setFilterStatus('active')}>待办</button>
          <button className={filterStatus === 'completed' ? 'active' : ''} onClick={() => setFilterStatus('completed')}>已完成</button>
        </div>
        
        <div className="sort-select">
          <SortAsc size={16} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="date">时间</option>
            <option value="priority">优先级</option>
          </select>
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? '未找到相关任务' : '目前没有任务，开启高效的一天吧！'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${editingId === task.id ? 'editing' : ''}`}>
              <button className="toggle-btn" onClick={() => !editingId && toggleTask(task.id)}>
                {task.completed ? <CheckCircle size={22} color="#4caf50" /> : <Circle size={22} />}
              </button>
              
              <div className="task-content">
                {editingId === task.id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-btn"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="cancel-btn"><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="task-text">{task.text}</span>
                    <div className="task-info">
                      <span className="info-tag category">{task.category}</span>
                      <span className="info-tag priority" style={{ color: priorityColor(task.priority) }}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className="info-tag date">{task.dueDate}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="item-actions">
                {!editingId && (
                  <button className="edit-btn" onClick={() => startEdit(task)}>
                    <Edit3 size={18} />
                  </button>
                )}
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
