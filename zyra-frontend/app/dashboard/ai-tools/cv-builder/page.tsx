'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Plus,
  Trash2,
  Save,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe
} from 'lucide-react'

interface CVSection {
  id: string
  title: string
  content: string
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects'
}

const mockCVSections: CVSection[] = [
  {
    id: '1',
    title: 'Personal Information',
    type: 'personal',
    content: 'John Doe\nSenior Software Engineer\njohn.doe@email.com\n+1 (555) 123-4567\nSan Francisco, CA'
  },
  {
    id: '2',
    title: 'Professional Experience',
    type: 'experience',
    content: 'Senior Software Engineer at TechCorp (2020-2024)\n• Led development of microservices architecture\n• Improved system performance by 40%\n• Mentored junior developers\n\nSoftware Engineer at StartupXYZ (2018-2020)\n• Built full-stack web applications\n• Implemented CI/CD pipelines\n• Collaborated with cross-functional teams'
  },
  {
    id: '3',
    title: 'Education',
    type: 'education',
    content: 'Bachelor of Science in Computer Science\nUniversity of California, Berkeley (2014-2018)\nGPA: 3.8/4.0\n\nRelevant Coursework:\n• Data Structures and Algorithms\n• Software Engineering\n• Database Systems'
  },
  {
    id: '4',
    title: 'Skills',
    type: 'skills',
    content: 'Programming Languages: JavaScript, Python, Java, TypeScript\nFrameworks: React, Node.js, Express, Django\nTools: Git, Docker, AWS, Kubernetes\nDatabases: PostgreSQL, MongoDB, Redis'
  },
  {
    id: '5',
    title: 'Projects',
    type: 'projects',
    content: 'E-commerce Platform (2023)\n• Built scalable e-commerce solution using React and Node.js\n• Implemented payment processing with Stripe\n• Deployed on AWS with Docker containers\n\nTask Management App (2022)\n• Developed real-time collaborative task management tool\n• Used WebSocket for live updates\n• Integrated with Google Calendar API'
  }
]

const sectionIcons = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Award,
  projects: Globe
}

const sectionColors = {
  personal: 'text-blue-400',
  experience: 'text-green-400',
  education: 'text-purple-400',
  skills: 'text-orange-400',
  projects: 'text-cyan-400'
}

export default function CVBuilderPage() {
  const [sections, setSections] = useState<CVSection[]>(mockCVSections)
  const [selectedSection, setSelectedSection] = useState<CVSection | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionType, setNewSectionType] = useState<'experience' | 'education' | 'skills' | 'projects'>('experience')

  const handleEditSection = (section: CVSection) => {
    setSelectedSection(section)
    setIsEditing(true)
  }

  const handleSaveSection = () => {
    if (selectedSection) {
      setSections(prev => 
        prev.map(section => 
          section.id === selectedSection.id ? selectedSection : section
        )
      )
    }
    setIsEditing(false)
    setSelectedSection(null)
  }

  const handleAddSection = () => {
    const newSection: CVSection = {
      id: Date.now().toString(),
      title: newSectionType.charAt(0).toUpperCase() + newSectionType.slice(1),
      type: newSectionType,
      content: ''
    }
    setSections(prev => [...prev, newSection])
    setShowAddSection(false)
  }

  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id))
  }

  const handleDownloadCV = () => {
    console.log('Downloading CV...')
  }

  const handlePreviewCV = () => {
    console.log('Previewing CV...')
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - CV Sections */}
      <div className="w-80 glass-sidebar border-r border-zyra-glass-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-cyber font-bold gradient-text">CV Builder</h2>
          <motion.button
            onClick={() => setShowAddSection(true)}
            className="p-2 rounded-lg bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="space-y-2">
          {sections.map((section, index) => {
            const Icon = sectionIcons[section.type]
            const color = sectionColors[section.type]
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border border-white/10 hover:border-zyra-cyan-blue/50 hover:bg-white/5 transition-colors cursor-pointer ${
                  selectedSection?.id === section.id ? 'border-zyra-cyan-blue bg-zyra-cyan-blue/10' : ''
                }`}
                onClick={() => setSelectedSection(section)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-white/5`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-white">{section.title}</div>
                      <div className="text-sm text-zyra-text-secondary capitalize">{section.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditSection(section)
                      }}
                      className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSection(section.id)
                      }}
                      className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <motion.button
            onClick={handlePreviewCV}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-5 h-5" />
            <span>Preview CV</span>
          </motion.button>
          
          <motion.button
            onClick={handleDownloadCV}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {selectedSection ? (
          <div className="max-w-4xl">
            {isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-cyber font-bold gradient-text">
                    Edit {selectedSection.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-zyra-text-secondary hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleSaveSection}
                      className="flex items-center space-x-2 px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Content</label>
                  <textarea
                    value={selectedSection.content}
                    onChange={(e) => setSelectedSection({ ...selectedSection, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary resize-none"
                    placeholder="Enter your content here..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-cyber font-bold gradient-text">
                    {selectedSection.title}
                  </h3>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                    {selectedSection.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-zyra-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Select a section to edit</h3>
              <p className="text-zyra-text-secondary">Choose a section from the sidebar to start building your CV</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddSection(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-8 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-cyber font-bold gradient-text mb-6">
              Add New Section
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Section Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['experience', 'education', 'skills', 'projects'] as const).map((type) => {
                    const Icon = sectionIcons[type]
                    const color = sectionColors[type]
                    return (
                      <button
                        key={type}
                        onClick={() => setNewSectionType(type)}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          newSectionType === type 
                            ? 'border-zyra-cyan-blue bg-zyra-cyan-blue/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <span className="text-white font-medium capitalize">{type}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowAddSection(false)}
                className="px-6 py-3 text-zyra-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                className="px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl font-medium transition-colors"
              >
                Add Section
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
