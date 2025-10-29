import { createZyraClient } from '../src';

// Initialize the Zyra client
const zyra = createZyraClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.zyra.com/api' // Optional, defaults to production API
});

async function emailAutomationExample() {
  try {
    // Create a new email automation
    const automation = await zyra.createEmailAutomation({
      name: 'Welcome Email Series',
      description: 'Automated welcome sequence for new users',
      triggers: {
        type: 'user_signup',
        conditions: ['email_verified']
      },
      conditions: {
        user_segment: 'premium',
        timezone: 'UTC'
      },
      actions: {
        type: 'send_email',
        template: 'welcome_template',
        delay: '1 hour'
      },
      schedule: {
        frequency: 'daily',
        time: '09:00'
      },
      settings: {
        max_retries: 3,
        retry_delay: '5 minutes'
      },
      isActive: true
    });

    console.log('Automation created:', automation.data);

    // List all automations
    const automations = await zyra.getEmailAutomations(1, 10);
    console.log('Automations:', automations.data);

    // Trigger automation manually
    const triggerResult = await zyra.triggerEmailAutomation(automation.data!.id, {
      manual: true,
      user_id: '123'
    });
    console.log('Automation triggered:', triggerResult.data);

    // Update automation
    const updateResult = await zyra.updateEmailAutomation(automation.data!.id, {
      name: 'Updated Welcome Series',
      isActive: false
    });
    console.log('Automation updated:', updateResult.success);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function aiAnalysisExample() {
  try {
    // Analyze email content
    const analysis = await zyra.analyzeContent('email', 'email_123', {
      model: 'gpt-4',
      temperature: 0.7
    });
    console.log('AI Analysis:', analysis.data);

    // Generate CV
    const cv = await zyra.generateCV({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA'
      },
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          duration: '2020-2023',
          description: 'Led development of microservices architecture'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          university: 'Stanford University',
          year: '2018'
        }
      ],
      skills: ['JavaScript', 'Python', 'React', 'Node.js'],
      template: 'modern'
    });
    console.log('CV Generated:', cv.data);

    // Generate social media content
    const socialContent = await zyra.generateSocialContent({
      platform: 'twitter',
      topic: 'AI and automation',
      tone: 'professional',
      targetAudience: 'tech professionals',
      includeHashtags: true,
      includeCallToAction: true
    });
    console.log('Social Content:', socialContent.data);

    // Generate persona
    const persona = await zyra.generatePersona({
      dataSource: 'customer_data',
      sampleSize: 1000,
      criteria: {
        age_range: '25-35',
        interests: ['technology', 'business']
      }
    });
    console.log('Persona Generated:', persona.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function reportsExample() {
  try {
    // Create a scheduled report
    const report = await zyra.createReport({
      name: 'Monthly Sales Report',
      type: 'scheduled',
      frequency: 'monthly',
      query: {
        type: 'sql',
        sql: 'SELECT * FROM sales WHERE created_at >= NOW() - INTERVAL 1 MONTH'
      },
      recipients: [
        { email: 'manager@company.com', name: 'Sales Manager' }
      ],
      settings: {
        format: 'pdf',
        template: 'sales_report'
      }
    });
    console.log('Report created:', report.data);

    // Run report manually
    const runResult = await zyra.runReport(report.data!.id);
    console.log('Report run triggered:', runResult.data);

    // Download report
    const reportBuffer = await zyra.downloadReport(runResult.data!.runId);
    console.log('Report downloaded, size:', reportBuffer.length, 'bytes');

  } catch (error) {
    console.error('Error:', error);
  }
}

async function integrationsExample() {
  try {
    // Get integration status
    const status = await zyra.getIntegrationStatus();
    console.log('Integration Status:', status.data);

    // Request verification for social media account
    const verification = await zyra.requestVerification(
      'facebook_page',
      'page_123',
      'email'
    );
    console.log('Verification requested:', verification.data);

    // Confirm verification (in real scenario, user would enter the code)
    const confirmResult = await zyra.confirmVerification('verification_token_here');
    console.log('Verification confirmed:', confirmResult.data);

    // Test connection
    const testResult = await zyra.testConnection('email');
    console.log('Connection test:', testResult.data);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function healthCheckExample() {
  try {
    const health = await zyra.healthCheck();
    console.log('API Health:', health.data);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Run examples
async function runExamples() {
  console.log('=== Zyra SDK Examples ===\n');

  console.log('1. Email Automation Example:');
  await emailAutomationExample();

  console.log('\n2. AI Analysis Example:');
  await aiAnalysisExample();

  console.log('\n3. Reports Example:');
  await reportsExample();

  console.log('\n4. Integrations Example:');
  await integrationsExample();

  console.log('\n5. Health Check Example:');
  await healthCheckExample();
}

// Export for use in other files
export {
  emailAutomationExample,
  aiAnalysisExample,
  reportsExample,
  integrationsExample,
  healthCheckExample,
  runExamples
};

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
