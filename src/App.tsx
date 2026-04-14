import { useState, useEffect } from 'react'
import './App.css'

// Types
interface Job {
  id: string
  company: string
  position: string
  dateApplied: string
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Offered'
  comments: string
}

type FormMode = 'add' | 'edit' | null

// Local Storage Hook
function useLocalStorage(key: string, initialValue: Job[]) {
  const [storedValue, setStoredValue] = useState<Job[]>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: Job[]) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

// Job Form Component
interface JobFormProps {
  mode: FormMode
  initialJob?: Job
  onSubmit: (job: Omit<Job, 'id'>) => void
  onCancel: () => void
}

function JobForm({ mode, initialJob, onSubmit, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState({
    company: initialJob?.company || '',
    position: initialJob?.position || '',
    dateApplied: initialJob?.dateApplied || new Date().toISOString().split('T')[0],
    status: initialJob?.status || 'Applied' as const,
    comments: initialJob?.comments || '',
  })

  useEffect(() => {
    if (mode === 'edit' && initialJob) {
      setFormData({
        company: initialJob.company,
        position: initialJob.position,
        dateApplied: initialJob.dateApplied,
        status: initialJob.status,
        comments: initialJob.comments,
      })
    } else if (mode === 'add') {
      setFormData({
        company: '',
        position: '',
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        comments: '',
      })
    }
  }, [mode, initialJob])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!mode) return null

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>{mode === 'add' ? 'Add New Job' : 'Edit Job'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="company">Company Name *</label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="position">Job Position *</label>
            <input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateApplied">Date Applied *</label>
            <input
              id="dateApplied"
              type="date"
              value={formData.dateApplied}
              onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Rejected">Rejected</option>
              <option value="Offered">Offered</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Add any notes about this job application..."
              rows={4}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {mode === 'add' ? 'Add Job' : 'Update Job'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Job List Component
interface JobListProps {
  jobs: Job[]
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
}

function JobList({ jobs, onEdit, onDelete }: JobListProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'Applied':
        return 'status-applied'
      case 'Interviewing':
        return 'status-interviewing'
      case 'Rejected':
        return 'status-rejected'
      case 'Offered':
        return 'status-offered'
    }
  }

  if (jobs.length === 0) {
    return <p className="empty-state">No jobs tracked yet. Add your first application!</p>
  }

  return (
    <div className="jobs-table-container">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <>
              <tr>
                <td className="company-cell">{job.company}</td>
                <td>{job.position}</td>
                <td>{new Date(job.dateApplied).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="actions-cell">
                  {job.comments && (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      title="View/hide comments"
                    >
                      {expandedJobId === job.id ? 'Hide' : 'Show'} Comments
                    </button>
                  )}
                  <button className="btn btn-sm btn-edit" onClick={() => onEdit(job)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => onDelete(job.id)}>
                    Delete
                  </button>
                </td>
              </tr>
              {expandedJobId === job.id && job.comments && (
                <tr className="comments-row">
                  <td colSpan={5}>
                    <div className="comments-content">
                      <strong>Comments:</strong>
                      <p>{job.comments}</p>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main App Component
function App() {
  const [jobs, setJobs] = useLocalStorage('jobs', [])
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingJob, setEditingJob] = useState<Job | undefined>()
  const [filter, setFilter] = useState<Job['status'] | 'All'>('All')

  const handleAddJob = (jobData: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
    }
    setJobs([newJob, ...jobs])
    setFormMode(null)
  }

  const handleUpdateJob = (jobData: Omit<Job, 'id'>) => {
    if (editingJob) {
      setJobs(jobs.map((job) => (job.id === editingJob.id ? { ...job, ...jobData } : job)))
      setFormMode(null)
      setEditingJob(undefined)
    }
  }

  const handleEditClick = (job: Job) => {
    setEditingJob(job)
    setFormMode('edit')
  }

  const handleFormSubmit = (jobData: Omit<Job, 'id'>) => {
    if (formMode === 'add') {
      handleAddJob(jobData)
    } else {
      handleUpdateJob(jobData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job application?')) {
      setJobs(jobs.filter((job) => job.id !== id))
    }
  }

  const filteredJobs = filter === 'All' ? jobs : jobs.filter((job) => job.status === filter)

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === 'Applied').length,
    interviewing: jobs.filter((j) => j.status === 'Interviewing').length,
    rejected: jobs.filter((j) => j.status === 'Rejected').length,
    offered: jobs.filter((j) => j.status === 'Offered').length,
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Job Tracker</h1>
        <p>Track your job applications and stay organized</p>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.applied}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.interviewing}</div>
          <div className="stat-label">Interviewing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.offered}</div>
          <div className="stat-label">Offers</div>
        </div>
      </div>

      <div className="controls">
        <button
          className="btn btn-primary btn-large"
          onClick={() => {
            setEditingJob(undefined)
            setFormMode('add')
          }}
        >
          + Add Job Application
        </button>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'Applied' ? 'active' : ''}`}
            onClick={() => setFilter('Applied')}
          >
            Applied
          </button>
          <button
            className={`filter-btn ${filter === 'Interviewing' ? 'active' : ''}`}
            onClick={() => setFilter('Interviewing')}
          >
            Interviewing
          </button>
          <button
            className={`filter-btn ${filter === 'Rejected' ? 'active' : ''}`}
            onClick={() => setFilter('Rejected')}
          >
            Rejected
          </button>
          <button
            className={`filter-btn ${filter === 'Offered' ? 'active' : ''}`}
            onClick={() => setFilter('Offered')}
          >
            Offers
          </button>
        </div>
      </div>

      <main className="main-content">
        <JobList jobs={filteredJobs} onEdit={handleEditClick} onDelete={handleDelete} />
      </main>

      <JobForm
        mode={formMode}
        initialJob={editingJob}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setFormMode(null)
          setEditingJob(undefined)
        }}
      />
    </div>
  )
}

export default App

