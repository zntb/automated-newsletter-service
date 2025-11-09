// lib/email-templates.ts

export interface EmailTemplateData {
  name: string;
  subject: string;
  content: string;
  preview: string;
  category: string;
  variables?: string[];
  thumbnail?: string;
}

export const emailTemplates: EmailTemplateData[] = [
  {
    name: 'Modern Newsletter',
    subject: '{{company}} Weekly Update - {{date}}',
    category: 'newsletter',
    preview:
      'Clean, modern design with hero image and featured content sections',
    variables: [
      'company',
      'date',
      'hero_title',
      'hero_subtitle',
      'featured_articles',
    ],
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
    .hero { padding: 0; }
    .hero img { width: 100%; display: block; }
    .hero-content { padding: 40px 30px; text-align: center; }
    .hero-content h2 { margin: 0 0 15px; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3; }
    .hero-content p { margin: 0; font-size: 16px; color: #666666; line-height: 1.6; }
    .content { padding: 20px 30px; }
    .article { margin-bottom: 40px; border-bottom: 1px solid #e5e5e5; padding-bottom: 30px; }
    .article:last-child { border-bottom: none; margin-bottom: 0; }
    .article-image { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
    .article h3 { margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #1a1a1a; }
    .article p { margin: 0 0 15px; font-size: 15px; color: #666666; line-height: 1.7; }
    .article .read-more { display: inline-block; padding: 12px 24px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; transition: background-color 0.3s; }
    .article .read-more:hover { background-color: #5568d3; }
    .cta { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; margin: 30px 0; }
    .cta h3 { margin: 0 0 15px; font-size: 24px; font-weight: 700; color: #ffffff; }
    .cta p { margin: 0 0 20px; font-size: 15px; color: rgba(255,255,255,0.9); }
    .cta a { display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; }
    .footer { background-color: #1a1a1a; padding: 30px; text-align: center; color: #ffffff; }
    .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .social-links { margin: 20px 0; }
    .social-links a { display: inline-block; margin: 0 8px; padding: 8px 16px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">👋</div>
      <h1>Welcome Aboard!</h1>
      <p>We're so excited to have you here</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi {{user_name}},</p>
      
      <p>Thank you for joining {{company}}! You're now part of a community of thousands who are transforming the way they work and achieve their goals.</p>
      
      <p>We're committed to helping you succeed, and we've prepared everything you need to get started on the right foot.</p>
      
      <div class="benefits">
        <h3>What You Get as a Member:</h3>
        <div class="benefit">
          <span class="benefit-icon">✨</span>
          <p><strong>Weekly Insights:</strong> Curated content delivered to your inbox every week</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🎯</span>
          <p><strong>Exclusive Resources:</strong> Access to guides, templates, and tools</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🤝</span>
          <p><strong>Community Access:</strong> Connect with like-minded professionals</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🎁</span>
          <p><strong>Special Offers:</strong> Early access to new features and promotions</p>
        </div>
      </div>
      
      <h2 style="font-size: 24px; color: #1f2937; margin: 40px 0 25px;">Your Next Steps</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Complete Your Profile</h3>
            <p>Tell us about yourself so we can personalize your experience. <a href="#">Complete profile →</a></p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Explore Our Resources</h3>
            <p>Check out our library of guides and tutorials to get the most out of your membership. <a href="#">Browse resources →</a></p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Join the Community</h3>
            <p>Connect with other members, share insights, and learn from their experiences. <a href="#">Join now →</a></p>
          </div>
        </div>
      </div>
      
      <p style="font-size: 15px; color: #6b7280; border-left: 3px solid #10b981; padding-left: 20px; margin: 30px 0;">
        <strong style="color: #1f2937;">Pro Tip:</strong> Set up your preferences to receive content tailored to your interests. You can always adjust these settings later.
      </p>
      
      <div class="cta">
        <a href="#" class="cta-button">Get Started Now</a>
      </div>
      
      <p>If you have any questions, don't hesitate to reach out. Our team is here to help you succeed!</p>
      
      <p style="margin-top: 40px;">Cheers,<br><strong style="color: #1f2937;">The {{company}} Team</strong></p>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="#">Twitter</a>
        <a href="#">LinkedIn</a>
        <a href="#">Discord</a>
      </div>
      <p>© 2025 {{company}}. All rights reserved.</p>
      <p><a href="#">Help Center</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },

  {
    name: 'Monthly Summary',
    subject: '📊 Your {{month}} Summary',
    category: 'newsletter',
    preview: 'Data-driven monthly performance summary with metrics',
    variables: ['month', 'metrics'],
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Summary</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 50px 40px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 10px; font-size: 32px; font-weight: 800; }
    .header p { margin: 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; color: #1e293b; margin: 0 0 30px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
    .metric-card { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #cbd5e1; }
    .metric-value { font-size: 36px; font-weight: 800; color: #6366f1; margin: 0 0 5px; }
    .metric-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin: 0; }
    .metric-change { font-size: 12px; color: #10b981; margin-top: 8px; font-weight: 600; }
    .metric-change.negative { color: #ef4444; }
    .section { margin: 40px 0; }
    .section h2 { font-size: 22px; color: #1e293b; margin: 0 0 20px; font-weight: 700; }
    .achievement { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .achievement h3 { margin: 0 0 8px; font-size: 17px; color: #92400e; font-weight: 700; }
    .achievement p { margin: 0; font-size: 14px; color: #78350f; line-height: 1.6; }
    .insight { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
    .insight h3 { margin: 0 0 8px; font-size: 17px; color: #1e40af; font-weight: 700; }
    .insight p { margin: 0; font-size: 14px; color: #1e3a8a; line-height: 1.6; }
    .goals { margin: 30px 0; }
    .goal { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0; }
    .goal:last-child { border-bottom: none; }
    .goal-icon { width: 24px; margin-right: 15px; font-size: 20px; }
    .goal-content { flex: 1; }
    .goal-content p { margin: 0 0 5px; font-size: 15px; color: #334155; font-weight: 600; }
    .progress-bar { height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.3s; }
    .cta-section { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; margin: 40px 0; border-radius: 12px; }
    .cta-section h3 { margin: 0 0 15px; font-size: 24px; color: #ffffff; font-weight: 700; }
    .cta-section p { margin: 0 0 25px; font-size: 15px; color: rgba(255,255,255,0.95); }
    .cta-button { display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #6366f1; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 8px; transition: transform 0.2s; }
    .cta-button:hover { transform: translateY(-2px); }
    .footer { padding: 30px 40px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; font-size: 13px; color: #64748b; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your {{month}} Summary</h1>
      <p>Here's how you performed this month</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi {{user_name}},</p>
      <p style="font-size: 16px; color: #475569; line-height: 1.7; margin: 0 0 30px;">Great work this month! Here's a comprehensive look at your progress, achievements, and areas of opportunity.</p>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <p class="metric-value">24</p>
          <p class="metric-label">Tasks Completed</p>
          <p class="metric-change">↑ 12% from last month</p>
        </div>
        
        <div class="metric-card">
          <p class="metric-value">18h</p>
          <p class="metric-label">Time Saved</p>
          <p class="metric-change">↑ 23% from last month</p>
        </div>
        
        <div class="metric-card">
          <p class="metric-value">94%</p>
          <p class="metric-label">Goal Achievement</p>
          <p class="metric-change">↑ 8% from last month</p>
        </div>
        
        <div class="metric-card">
          <p class="metric-value">156</p>
          <p class="metric-label">Streak Days</p>
          <p class="metric-change">New personal record!</p>
        </div>
      </div>
      
      <div class="section">
        <h2>🏆 Top Achievements</h2>
        <div class="achievement">
          <h3>Perfect Week Streak</h3>
          <p>You completed all your goals for 3 consecutive weeks. That's dedication!</p>
        </div>
        <div class="achievement">
          <h3>Productivity Master</h3>
          <p>You've maintained an average productivity score above 90% this month.</p>
        </div>
      </div>
      
      <div class="section">
        <h2>💡 Key Insights</h2>
        <div class="insight">
          <h3>Peak Performance Time</h3>
          <p>Your most productive hours are between 9 AM - 11 AM. Consider scheduling important tasks during this window.</p>
        </div>
        <div class="insight">
          <h3>Collaboration Boost</h3>
          <p>Projects with team collaboration showed 35% faster completion rates.</p>
        </div>
      </div>
      
      <div class="section">
        <h2>🎯 Progress Toward Goals</h2>
        <div class="goals">
          <div class="goal">
            <span class="goal-icon">📈</span>
            <div class="goal-content">
              <p>Complete 30 tasks</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 80%;"></div>
              </div>
            </div>
          </div>
          <div class="goal">
            <span class="goal-icon">🎓</span>
            <div class="goal-content">
              <p>Learn new skill</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 65%;"></div>
              </div>
            </div>
          </div>
          <div class="goal">
            <span class="goal-icon">🤝</span>
            <div class="goal-content">
              <p>Network connections</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 95%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 30px 0;">Keep up the excellent work! You're on track to achieve all your goals for this quarter.</p>
    </div>
    
    <div class="cta-section">
      <h3>Ready for Next Month?</h3>
      <p>Set your goals and continue your success streak</p>
      <a href="#" class="cta-button">Plan Next Month</a>
    </div>
    
    <div class="footer">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p><a href="#">View Detailed Report</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },

  {
    name: 'Promotion Campaign',
    subject: '🎁 Exclusive Offer Just for You',
    category: 'marketing',
    preview: 'Eye-catching promotional email with countdown timer',
    variables: ['discount_percentage', 'promo_code', 'expiry_date'],
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .badge { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-align: center; padding: 12px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .header { padding: 50px 40px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%); }
    .offer-badge { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; padding: 15px 30px; border-radius: 50px; font-size: 42px; font-weight: 900; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(239,68,68,0.3); }
    .header h1 { margin: 0 0 15px; font-size: 36px; font-weight: 800; color: #1f2937; line-height: 1.2; }
    .header p { margin: 0; font-size: 18px; color: #6b7280; }
    .countdown { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; text-align: center; }
    .countdown p { margin: 0 0 15px; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .countdown-timer { display: flex; justify-content: center; gap: 20px; }
    .time-box { background-color: #374151; padding: 15px 20px; border-radius: 8px; min-width: 70px; }
    .time-value { font-size: 32px; font-weight: 800; color: #ef4444; display: block; margin-bottom: 5px; }
    .time-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 50px 40px; }
    .promo-highlight { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px dashed #ef4444; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .promo-highlight h3 { margin: 0 0 15px; font-size: 18px; color: #991b1b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .promo-code { font-size: 32px; font-weight: 900; color: #ef4444; letter-spacing: 2px; font-family: 'Courier New', monospace; margin: 15px 0; display: block; }
    .copy-code { display: inline-block; padding: 10px 20px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 700; margin-top: 10px; }
    .products { margin: 40px 0; }
    .product { display: flex; background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px; overflow: hidden; }
    .product-image { width: 120px; height: 120px; background-color: #e5e7eb; border-radius: 8px; margin-right: 20px; flex-shrink: 0; object-fit: cover; }
    .product-details h4 { margin: 0 0 8px; font-size: 18px; color: #1f2937; font-weight: 700; }
    .product-details p { margin: 0 0 12px; font-size: 14px; color: #6b7280; line-height: 1.6; }
    .price { display: flex; align-items: center; gap: 10px; }
    .original-price { font-size: 16px; color: #9ca3af; text-decoration: line-through; }
    .sale-price { font-size: 24px; color: #ef4444; font-weight: 800; }
    .cta-section { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 50px 40px; text-align: center; }
    .cta-section h3 { margin: 0 0 15px; font-size: 28px; color: #ffffff; font-weight: 800; }
    .cta-section p { margin: 0 0 30px; font-size: 16px; color: rgba(255,255,255,0.95); }
    .shop-button { display: inline-block; padding: 18px 50px; background-color: #ffffff; color: #ef4444; text-decoration: none; font-size: 18px; font-weight: 800; border-radius: 50px; box-shadow: 0 8px 30px rgba(0,0,0,0.3); transition: transform 0.2s; }
    .shop-button:hover { transform: translateY(-3px); }
    .terms { padding: 30px 40px; background-color: #f9fafb; }
    .terms p { margin: 0 0 8px; font-size: 12px; color: #6b7280; line-height: 1.6; }
    .footer { padding: 30px 40px; text-align: center; background-color: #1f2937; color: #9ca3af; }
    .footer p { margin: 5px 0; font-size: 13px; }
    .footer a { color: #ef4444; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">⚡ Limited Time Offer - Don't Miss Out!</div>
    
    <div class="header">
      <div class="offer-badge">{{discount_percentage}}% OFF</div>
      <h1>Exclusive Deal Just for You</h1>
      <p>Your favorite products at unbeatable prices</p>
    </div>
    
    <div class="countdown">
      <p>Offer Expires In:</p>
      <div class="countdown-timer">
        <div class="time-box">
          <span class="time-value">02</span>
          <span class="time-label">Days</span>
        </div>
        <div class="time-box">
          <span class="time-value">14</span>
          <span class="time-label">Hours</span>
        </div>
        <div class="time-box">
          <span class="time-value">32</span>
          <span class="time-label">Minutes</span>
        </div>
        <div class="time-box">
          <span class="time-value">18</span>
          <span class="time-label">Seconds</span>
        </div>
      </div>
    </div>
    
    <div class="content">
      <p style="font-size: 17px; color: #374151; line-height: 1.7; margin: 0 0 30px;">As a valued customer, you get exclusive early access to our biggest sale of the year. Use the code below to unlock your discount!</p>
      
      <div class="promo-highlight">
        <h3>Your Exclusive Code</h3>
        <span class="promo-code">{{promo_code}}</span>
        <p style="font-size: 14px; color: #7f1d1d; margin: 10px 0 0;">Copy this code at checkout</p>
        <a href="#" class="copy-code">Copy Code</a>
      </div>
      
      <h2 style="font-size: 24px; color: #1f2937; margin: 40px 0 25px; font-weight: 800;">Featured Deals</h2>
      
      <div class="products">
        <div class="product">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" alt="Product" class="product-image" />
          <div class="product-details">
            <h4>Premium Headphones</h4>
            <p>Immersive sound quality with noise cancellation</p>
            <div class="price">
              <span class="original-price">$299</span>
              <span class="sale-price">$179</span>
            </div>
          </div>
        </div>
        
        <div class="product">
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" alt="Product" class="product-image" />
          <div class="product-details">
            <h4>Smart Watch Pro</h4>
            <p>Track your fitness and stay connected</p>
            <div class="price">
              <span class="original-price">$399</span>
              <span class="sale-price">$239</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cta-section">
      <h3>Start Shopping Now</h3>
      <p>Don't let this amazing offer slip away</p>
      <a href="#" class="shop-button">Shop the Sale →</a>
    </div>
    
    <div class="terms">
      <p><strong>Terms & Conditions:</strong></p>
      <p>• Offer valid until {{expiry_date}}</p>
      <p>• Discount applies to regular-priced items only</p>
      <p>• Cannot be combined with other offers</p>
      <p>• One use per customer</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p><a href="#">Help Center</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },

  {
    name: 'Welcome Series',
    subject: "Welcome to {{company}}! Let's get started 👋",
    category: 'welcome',
    preview: 'Warm, friendly onboarding email for new subscribers',
    variables: ['company', 'next_steps'],
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f0fdf4; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 40px; text-align: center; color: #ffffff; }
    .emoji { font-size: 72px; margin-bottom: 20px; animation: wave 1s ease-in-out infinite; }
    @keyframes wave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(20deg); } }
    .header h1 { margin: 0 0 10px; font-size: 36px; font-weight: 800; }
    .header p { margin: 0; font-size: 17px; opacity: 0.95; }
    .content { padding: 50px 40px; }
    .greeting { font-size: 20px; color: #1f2937; margin: 0 0 25px; font-weight: 600; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.8; margin: 0 0 25px; }
    .steps { margin: 40px 0; }
    .step { display: flex; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e5e7eb; }
    .step:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .step-number { width: 40px; height: 40px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-right: 20px; flex-shrink: 0; }
    .step-content h3 { margin: 0 0 8px; font-size: 18px; color: #1f2937; font-weight: 700; }
    .step-content p { margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6; }
    .step-content a { color: #10b981; text-decoration: none; font-weight: 600; }
    .benefits { background-color: #f0fdf4; padding: 30px; border-radius: 12px; margin: 30px 0; }
    .benefits h3 { margin: 0 0 20px; font-size: 20px; color: #1f2937; font-weight: 700; }
    .benefit { display: flex; align-items: start; margin-bottom: 15px; }
    .benefit:last-child { margin-bottom: 0; }
    .benefit-icon { font-size: 20px; margin-right: 12px; }
    .benefit p { margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6; }
    .cta { text-align: center; padding: 40px 0; }
    .cta-button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-size: 17px; font-weight: 700; border-radius: 50px; box-shadow: 0 4px 15px rgba(16,185,129,0.4); transition: transform 0.2s; }
    .cta-button:hover { transform: translateY(-2px); }
    .footer { padding: 30px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">👋</div>
      <h1>Welcome to {{company}}!</h1>
      <p>We're thrilled to have you join our community</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi {{user_name}},</p>
      
      <p>Thank you for choosing {{company}}! We're excited to help you achieve your goals and make the most of our platform.</p>
      
      <div class="benefits">
        <h3>Here's what you can expect:</h3>
        <div class="benefit">
          <span class="benefit-icon">🚀</span>
          <p><strong>Get started quickly</strong> with our intuitive onboarding process</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">💡</span>
          <p><strong>Learn from experts</strong> through our comprehensive resources</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🤝</span>
          <p><strong>Join our community</strong> of like-minded professionals</p>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🎯</span>
          <p><strong>Achieve your goals</strong> faster with our proven methods</p>
        </div>
      </div>
      
      <div class="steps">
        <h3>Your Getting Started Guide:</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Complete Your Profile</h3>
            <p>Tell us about yourself to personalize your experience. <a href="#">Update profile →</a></p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Explore Key Features</h3>
            <p>Take a tour of our most popular tools and features. <a href="#">Start tour →</a></p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Join Your First Activity</h3>
            <p>Dive in and participate in your first community event. <a href="#">View events →</a></p>
          </div>
        </div>
      </div>
      
      <div class="cta">
        <a href="#" class="cta-button">Begin Your Journey</a>
      </div>
      
      <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team. We're here to help you succeed!</p>
      
      <p style="margin-top: 30px;">Warmly,<br><strong>The {{company}} Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 {{company}}. All rights reserved.</p>
      <p><a href="#">Help Center</a> | <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },
];

// Helper function to get template by category
export function getTemplatesByCategory(category: string): EmailTemplateData[] {
  return emailTemplates.filter(t => t.category === category);
}

// Helper function to replace variables in template
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>,
): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}
