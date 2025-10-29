'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Code, 
  Copy, 
  Play, 
  BookOpen, 
  Shield, 
  Zap,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  category: string
  auth: boolean
  parameters: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  responses: {
    code: number
    description: string
    example: any
  }[]
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: 'create-automation',
    method: 'POST',
    path: '/api/v1/automations',
    description: 'Create a new automation workflow',
    category: 'Automations',
    auth: true,
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Name of the automation' },
      { name: 'description', type: 'string', required: false, description: 'Description of the automation' },
      { name: 'triggers', type: 'array', required: true, description: 'Array of trigger configurations' },
      { name: 'actions', type: 'array', required: true, description: 'Array of action configurations' }
    ],
    responses: [
      { code: 201, description: 'Automation created successfully', example: { id: 'auto_123', name: 'Welcome Email', status: 'active' } },
      { code: 400, description: 'Invalid request data', example: { error: 'Missing required field: name' } },
      { code: 401, description: 'Unauthorized', example: { error: 'Invalid API key' } }
    ]
  },
  {
    id: 'list-automations',
    method: 'GET',
    path: '/api/v1/automations',
    description: 'List all automations for the authenticated user',
    category: 'Automations',
    auth: true,
    parameters: [
      { name: 'limit', type: 'integer', required: false, description: 'Number of results to return (max 100)' },
      { name: 'offset', type: 'integer', required: false, description: 'Number of results to skip' },
      { name: 'status', type: 'string', required: false, description: 'Filter by automation status' }
    ],
    responses: [
      { code: 200, description: 'List of automations', example: { automations: [], total: 0, limit: 20, offset: 0 } },
      { code: 401, description: 'Unauthorized', example: { error: 'Invalid API key' } }
    ]
  },
  {
    id: 'send-message',
    method: 'POST',
    path: '/api/v1/messages/send',
    description: 'Send a message via WhatsApp or email',
    category: 'Messaging',
    auth: true,
    parameters: [
      { name: 'channel', type: 'string', required: true, description: 'Message channel (whatsapp, email, sms)' },
      { name: 'recipient', type: 'string', required: true, description: 'Recipient phone number or email' },
      { name: 'content', type: 'string', required: true, description: 'Message content' },
      { name: 'template', type: 'string', required: false, description: 'Template ID to use' }
    ],
    responses: [
      { code: 200, description: 'Message sent successfully', example: { id: 'msg_123', status: 'sent', timestamp: '2025-01-01T12:00:00Z' } },
      { code: 400, description: 'Invalid request', example: { error: 'Invalid recipient format' } }
    ]
  },
  {
    id: 'generate-content',
    method: 'POST',
    path: '/api/v1/ai/generate',
    description: 'Generate content using AI',
    category: 'AI',
    auth: true,
    parameters: [
      { name: 'prompt', type: 'string', required: true, description: 'Content generation prompt' },
      { name: 'type', type: 'string', required: true, description: 'Content type (email, social, document)' },
      { name: 'tone', type: 'string', required: false, description: 'Content tone (professional, casual, friendly)' },
      { name: 'length', type: 'string', required: false, description: 'Content length (short, medium, long)' }
    ],
    responses: [
      { code: 200, description: 'Content generated successfully', example: { content: 'Generated content here...', tokens_used: 150 } },
      { code: 429, description: 'Rate limit exceeded', example: { error: 'Too many requests' } }
    ]
  }
]

const codeExamples = {
  'create-automation': {
    curl: `curl -X POST https://api.zyra.com/v1/automations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Welcome Email Automation",
    "description": "Send welcome email to new users",
    "triggers": [
      {
        "type": "user_registration",
        "conditions": {}
      }
    ],
    "actions": [
      {
        "type": "send_email",
        "config": {
          "template": "welcome_template",
          "to": "{{user.email}}"
        }
    ]
  }'`,
    javascript: `const response = await fetch('https://api.zyra.com/v1/automations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Welcome Email Automation',
    description: 'Send welcome email to new users',
    triggers: [{
      type: 'user_registration',
      conditions: {}
    }],
    actions: [{
      type: 'send_email',
      config: {
        template: 'welcome_template',
        to: '{{user.email}}'
      }
    }]
  })
});

const automation = await response.json();`,
    python: `import requests

url = "https://api.zyra.com/v1/automations"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "name": "Welcome Email Automation",
    "description": "Send welcome email to new users",
    "triggers": [{
        "type": "user_registration",
        "conditions": {}
    }],
    "actions": [{
        "type": "send_email",
        "config": {
            "template": "welcome_template",
            "to": "{{user.email}}"
        }
    }]
}

response = requests.post(url, headers=headers, json=data)
automation = response.json()`
  }
}

export default function APIReferencePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(apiEndpoints[0])
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python'>('curl')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['authentication']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log('Code copied to clipboard')
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-500/10'
      case 'POST': return 'text-blue-400 bg-blue-500/10'
      case 'PUT': return 'text-yellow-400 bg-yellow-500/10'
      case 'DELETE': return 'text-red-400 bg-red-500/10'
      case 'PATCH': return 'text-purple-400 bg-purple-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-zyra-gradient cyber-grid">
      <div className="container mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zyra-cyan-blue mb-4">
              API Reference
            </h1>
            <p className="text-zyra-text-secondary text-lg mb-8">
              Complete API documentation for Zyra's automation platform
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="text-zyra-cyan-blue">
                Version 1.0
              </Badge>
              <Badge variant="outline" className="text-green-400">
                Live
              </Badge>
              <Badge variant="outline" className="text-blue-400">
                REST API
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - API Endpoints */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-white">API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <motion.button
                        key={endpoint.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEndpoint?.id === endpoint.id
                            ? 'bg-zyra-cyan-blue/20 border border-zyra-cyan-blue/30'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getMethodColor(endpoint.method)}`}
                          >
                            {endpoint.method}
                          </Badge>
                          <span className="text-sm font-medium text-white">
                            {endpoint.path}
                          </span>
                        </div>
                        <p className="text-xs text-zyra-text-secondary">
                          {endpoint.description}
                        </p>
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Authentication */}
              <Card className="glass-card">
                <CardHeader>
                  <button
                    onClick={() => toggleSection('authentication')}
                    className="flex items-center justify-between w-full"
                  >
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Authentication
                    </CardTitle>
                    {expandedSections.has('authentication') ? 
                      <ChevronDown className="w-5 h-5 text-zyra-text-secondary" /> :
                      <ChevronRight className="w-5 h-5 text-zyra-text-secondary" />
                    }
                  </button>
                </CardHeader>
                {expandedSections.has('authentication') && (
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        All API requests require authentication using an API key. Include your API key 
                        in the Authorization header of your requests.
                      </p>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Authorization Header</h4>
                        <code className="text-sm text-zyra-cyan-blue">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                      
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-400 mb-1">Security Notice</h4>
                            <p className="text-sm">
                              Keep your API key secure and never expose it in client-side code. 
                              Use environment variables for production applications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Selected Endpoint Details */}
              {selectedEndpoint && (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className={`${getMethodColor(selectedEndpoint.method)}`}
                        >
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-lg font-mono text-white">
                          {selectedEndpoint.path}
                        </code>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedEndpoint.auth && (
                          <Badge variant="outline" className="text-red-400">
                            Auth Required
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-blue-400">
                          {selectedEndpoint.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-zyra-text-secondary mt-2">
                      {selectedEndpoint.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Parameters */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Parameters</h4>
                      <div className="space-y-3">
                        {selectedEndpoint.parameters.map((param, index) => (
                          <div key={index} className="p-3 border border-white/10 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-zyra-cyan-blue">{param.name}</code>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs text-gray-400"
                                >
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs text-red-400"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-zyra-text-secondary">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Code Examples */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">Code Examples</h4>
                        <div className="flex items-center space-x-2">
                          {(['curl', 'javascript', 'python'] as const).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setSelectedLanguage(lang)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                selectedLanguage === lang
                                  ? 'bg-zyra-cyan-blue text-white'
                                  : 'bg-white/5 text-zyra-text-secondary hover:text-white'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <pre className="p-4 bg-black/50 rounded-lg overflow-x-auto">
                          <code className="text-sm text-white">
                            {codeExamples[selectedEndpoint.id as keyof typeof codeExamples]?.[selectedLanguage] || 'No example available'}
                          </code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(codeExamples[selectedEndpoint.id as keyof typeof codeExamples]?.[selectedLanguage] || '')}
                          className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Responses */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Responses</h4>
                      <div className="space-y-3">
                        {selectedEndpoint.responses.map((response, index) => (
                          <div key={index} className="p-3 border border-white/10 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  response.code >= 200 && response.code < 300 
                                    ? 'text-green-400 bg-green-500/10'
                                    : response.code >= 400 
                                    ? 'text-red-400 bg-red-500/10'
                                    : 'text-yellow-400 bg-yellow-500/10'
                                }`}
                              >
                                {response.code}
                              </Badge>
                              <span className="text-sm text-white">{response.description}</span>
                            </div>
                            <pre className="text-xs text-zyra-text-secondary bg-white/5 p-2 rounded">
                              {JSON.stringify(response.example, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rate Limits */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Rate Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Free Tier</h4>
                      <p className="text-2xl font-bold text-zyra-cyan-blue">100</p>
                      <p className="text-sm text-zyra-text-secondary">requests per hour</p>
                    </div>
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Pro Tier</h4>
                      <p className="text-2xl font-bold text-zyra-electric-violet">1,000</p>
                      <p className="text-sm text-zyra-text-secondary">requests per hour</p>
                    </div>
                    <div className="p-4 border border-zyra-glass-border rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Enterprise</h4>
                      <p className="text-2xl font-bold text-green-400">10,000</p>
                      <p className="text-sm text-zyra-text-secondary">requests per hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
