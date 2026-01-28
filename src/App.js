import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    requestedBy: '',
    assignedTo: '',
    status: '',
    project: '',
    workloads: []
  });

  const data = {
    requestedBy: ['Van', 'Phi', 'Vu', 'Huynh'],
    assignedTo: ['Gokul', 'Sharath', 'Darius', 'Ayaan'],
    status: ['Pending', 'In Progress', 'Completed'],
    project: ['Project A', 'Project B', 'Project C']
  };

  

  // Load tasks from localStorage on start
  useEffect(() => {
    const savedTasks = localStorage.getItem('savedTasks');
    if (savedTasks) {
      const t = JSON.parse(savedTasks)
      if (t.length > 0) {
        setTasks(JSON.parse(savedTasks));
      }
    }
  }, []);

  // Save tasks to localStorage when tasks have changes
  useEffect(() => {
    localStorage.setItem('savedTasks', JSON.stringify(tasks));
  }, [tasks]);

  function handleInputChange(e) {
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  function addWorkload() {
    const workload = { id: Date.now(), startDate: '', endDate: '' };
    setFormData(prev => ({ ...prev, workloads: [...prev.workloads, workload] }));
  };

  function updateWorkload(workloadId, field, value) {
    setFormData(prev => ({
      ...prev,
      workloads: prev.workloads.map(w => 
        w.id === workloadId ? { ...w, [field]: value } : w
      )
    }));
  };

  function deleteWorkload (workloadId) {
    setFormData(prev => ({
      ...prev,
      workloads: prev.workloads.filter(w => w.id !== workloadId)
    }));
  };

  function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    if (editingTask !== null) {
      // Update existing task
      setTasks(prev => prev.map((task, index) => 
        index === editingTask ? { ...formData, id: task.id } : task
      ));
    } else {
      // Add new task
      setTasks(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      requestedBy: '',
      assignedTo: '',
      status: '',
      project: '',
      workloads: []
    });
    setEditingTask(null);
  };

  function handleEdit(index) {
    const task = tasks[index];
    setFormData({ ...task });
    setEditingTask(index);
    setErrors({})
    setShowModal(true);
  };

  function handleDelete(index) {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  function handleNewTask() {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      requestedBy: '',
      assignedTo: '',
      status: '',
      project: '',
      workloads: []
    });
    setEditingTask(null);
    setErrors({})
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};

    // Task name required
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    // Start date required
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // End date required
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    // End date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Workload validation: each must have dates and end > start
    formData.workloads.forEach((workload, index) => {
      if (!workload.startDate) {
        newErrors[`workload-start-${workload.id}`] = `Workload ${index + 1} start date required`;
      }
      if (!workload.endDate) {
        newErrors[`workload-end-${workload.id}`] = `Workload ${index + 1} end date required`;
      }
      if (workload.startDate && workload.endDate) {
        const wStart = new Date(workload.startDate);
        const wEnd = new Date(workload.endDate);
        if (wEnd <= wStart) {
          newErrors[`workload-end-${workload.id}`] = `Workload ${index + 1} end date must be after start date`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <div className="container mt-4">
        <h1 className='mb-5'>TASK MANAGEMENT SYSTEM</h1>
        <div className="row mb-3">
          <div className="col">
            <button className="btn btn-primary" onClick={handleNewTask}>
              Add New Task
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Requested By</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Project</th>
                <th>Workloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id} onDoubleClick={() => handleEdit(index)} style={{ cursor: 'pointer' }}>
                  <td>{task.name}</td>
                  <td>{task.description}</td>
                  <td>{task.startDate}</td>
                  <td>{task.endDate}</td>
                  <td>{task.requestedBy}</td>
                  <td>{task.assignedTo}</td>
                  <td>
                    <span className={`badge ${
                      task.status === 'Completed' ? 'bg-success' : 
                      task.status === 'In Progress' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.project}</td>
                  <td>
                    <div>
                      {task.workloads.map(w => (
                        <span key={w.id} className="badge bg-secondary me-1 mb-1">
                          {w.startDate} - {w.endDate}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTask !== null ? 'Edit Task' : 'Add New Task'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Task Name</label>
                        <input 
                          type="text" 
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                          name="name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          required 
                        />
                        { errors.name && <div className="invalid-feedback">{errors.name}</div> }
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea 
                          className="form-control" 
                          rows={3}
                          name="description" 
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input 
                          type="date" 
                          className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} 
                          name="startDate" 
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                        { errors.startDate && <div className="invalid-feedback">{errors.startDate}</div> }
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input 
                          type="date" 
                          className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} 
                          name="endDate" 
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                        { errors.endDate && <div className="invalid-feedback">{errors.endDate}</div> }
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Requested By</label>
                        <select 
                          className="form-select" 
                          name="requestedBy" 
                          value={formData.requestedBy}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          {data.requestedBy.map(opt => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Assigned To</label>
                        <select 
                          className="form-select" 
                          name="assignedTo" 
                          value={formData.assignedTo}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          {data.assignedTo.map(opt => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select" 
                          name="status" 
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          {data.status.map(opt => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Project</label>
                        <select 
                          className="form-select" 
                          name="project" 
                          value={formData.project}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          {data.project.map(opt => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Workloads</label>
                    <div className="mb-2">
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={addWorkload}>
                        + Add Workload
                      </button>
                    </div>
                    {formData.workloads.map(workload => (
                      <div key={workload.id} className="row mb-2">
                        <div className="col-md-4">
                          <input
                            type="date"
                            className={`form-control ${errors[`workload-start-${workload.id}`] ? 'is-invalid' : ''}`}
                            value={workload.startDate}
                            onChange={(e) => updateWorkload(workload.id, 'startDate', e.target.value)}
                          />
                          {errors[`workload-start-${workload.id}`] && (
                            <div className="form-text text-danger">{errors[`workload-start-${workload.id}`]}</div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <input
                            type="date"
                            className={`form-control ${errors[`workload-end-${workload.id}`] ? 'is-invalid' : ''}`}
                            value={workload.endDate}
                            onChange={(e) => updateWorkload(workload.id, 'endDate', e.target.value)}
                          />
                          {errors[`workload-end-${workload.id}`] && (
                            <div className="form-text text-danger">{errors[`workload-end-${workload.id}`]}</div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <button 
                            type="button"
                            className="btn btn-danger btn-sm" 
                            onClick={() => deleteWorkload(workload.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
