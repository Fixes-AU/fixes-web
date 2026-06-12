import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Privacy Policy — Fixes Tradie App',
  description: 'Privacy Policy for the Fixes Tradie mobile application and platform.',
}

export default function TradiePrivacyPolicyPage() {
  const htmlContent = `
    <style>
      .privacy-container { font-family: 'Nunito Sans', system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.7; max-width: 780px; margin: 0 auto; padding: 40px 24px 80px; }
      .privacy-header { background: #001e00; padding: 32px 24px; text-align: center; border-radius: 12px; margin-bottom: 40px; }
      .privacy-header h1 { color: #fff; font-size: 28px; font-weight: 800; margin: 0; }
      .privacy-header p { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 8px; }
      .privacy-container .effective { text-align: center; font-size: 13px; color: #5e6d55; margin-bottom: 40px; padding: 12px 20px; background: #f0f5ed; border-radius: 8px; }
      .privacy-container h2 { font-size: 20px; font-weight: 800; color: #001e00; margin: 40px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #14a800; }
      .privacy-container h2:first-of-type { margin-top: 0; }
      .privacy-container h3 { font-size: 16px; font-weight: 700; color: #1a3a1a; margin: 24px 0 10px; }
      .privacy-container p { margin: 0 0 14px; color: #333; font-size: 15px; }
      .privacy-container ul, .privacy-container ol { margin: 0 0 16px 20px; color: #333; font-size: 15px; }
      .privacy-container li { margin-bottom: 6px; }
      .privacy-container table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; font-size: 14px; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
      .privacy-container th { background: #001e00; color: #fff; text-align: left; padding: 12px 14px; font-weight: 700; font-size: 13px; }
      .privacy-container td { padding: 10px 14px; border-bottom: 1px solid #eee; vertical-align: top; color: #333; }
      .privacy-container tr:last-child td { border-bottom: none; }
      .privacy-container .placeholder { background: #fff3cd; padding: 3px 8px; border-radius: 4px; font-weight: 700; color: #856404; font-size: 14px; }
      .privacy-container .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
      .privacy-container .highlight-box p { margin: 0; color: #15803d; }
      .privacy-container .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
      .privacy-container .warning-box p { margin: 0; color: #92400e; }
      .privacy-container a { color: #14a800; text-decoration: none; font-weight: 600; }
      .privacy-container a:hover { text-decoration: underline; }
      @media (max-width: 600px) { .privacy-container { padding: 24px 16px 60px; } .privacy-container h2 { font-size: 18px; } .privacy-container table { font-size: 13px; } .privacy-container th, .privacy-container td { padding: 8px 10px; } }
    </style>
    <div class="privacy-container">
      <div class="privacy-header">
        <h1>Privacy Policy</h1>
        <p>Fixes — Tradie Mobile Application &amp; Platform</p>
      </div>

      <div class="effective">
        <strong>Effective Date:</strong> <span class="placeholder">1 June 2026</span> &nbsp;|&nbsp;
        <strong>Last Updated:</strong> 11 May 2026
      </div>

      <h2>1. Introduction</h2>
      <p>
        <span class="placeholder">fixesau</span>
        (ABN: <span class="placeholder">52697058503</span>)
        ("Fixes", "we", "our", or "us") operates the <strong>Fixes</strong> mobile application
        (the "App") and related web platform available at
        <a href="https://www.fixesau.com">www.fixesau.com</a> (the "Platform").
      </p>
      <p>
        This Privacy Policy explains how we collect, use, disclose, store, and protect your personal information
        when you use our App, Platform, and related services (collectively, the "Services").
        We are committed to complying with the <strong>Australian Privacy Act 1988</strong> (Cth)
        and the <strong>Australian Privacy Principles</strong> (APPs), as well as the privacy requirements
        of the Apple App Store and Google Play Store.
      </p>
      <p>
        By creating an account or using our Services, you acknowledge that you have read and understood this Privacy Policy.
        If you do not agree with this Policy, please do not use our Services.
      </p>

      <div class="highlight-box">
        <p><strong>Age Restriction:</strong> Our Services are intended for users aged 18 years and older.
        We do not knowingly collect personal information from individuals under 18. If you are under 18,
        please do not use the App or provide any personal information.</p>
      </div>

      <h2>2. Information We Collect</h2>
      <p>We collect the following categories of personal information:</p>

      <h3>2.1 Information You Provide Directly</h3>
      <table>
        <tr><th>Data Category</th><th>Specific Data Collected</th><th>Purpose</th></tr>
        <tr>
          <td><strong>Account &amp; Identity</strong></td>
          <td>Full name, email address, phone number (optional), password (stored as bcrypt hash)</td>
          <td>Account creation, authentication, communication</td>
        </tr>
        <tr>
          <td><strong>Professional Profile</strong></td>
          <td>Trade categories, skill level (junior/senior/specialist), skills list, bio, service radius (km)</td>
          <td>Job matching, profile display, dispatch eligibility</td>
        </tr>
        <tr>
          <td><strong>Compliance Documents</strong></td>
          <td>ABN, trade licences, insurance certificates, white card, police checks (uploaded as PDF/images)</td>
          <td>Identity and qualification verification, regulatory compliance</td>
        </tr>
        <tr>
          <td><strong>Identity Verification</strong></td>
          <td>Government-issued ID photos (front and back) submitted during Stripe payout onboarding</td>
          <td>Financial compliance (KYC), payout account verification</td>
        </tr>
        <tr>
          <td><strong>Financial Information</strong></td>
          <td>BSB, bank account number, account holder name (for payouts); payment card details (processed by Stripe — never stored on our servers)</td>
          <td>Processing payments and payouts</td>
        </tr>
        <tr>
          <td><strong>Job Completion Photos</strong></td>
          <td>Photos of completed work (2–10 per job, watermarked with timestamp, location, and tradie ID)</td>
          <td>Work verification, dispute evidence, quality assurance</td>
        </tr>
        <tr>
          <td><strong>Messages</strong></td>
          <td>Text messages and images sent within job chat</td>
          <td>Communication between tradies and clients, dispute resolution</td>
        </tr>
        <tr>
          <td><strong>Bug Reports</strong></td>
          <td>Category, title, description, platform (iOS/Android), app version</td>
          <td>Service improvement and issue resolution</td>
        </tr>
      </table>

      <h3>2.2 Information Collected Automatically</h3>
      <table>
        <tr><th>Data Category</th><th>Specific Data Collected</th><th>Purpose</th></tr>
        <tr>
          <td><strong>Location Data</strong></td>
          <td>Real-time GPS coordinates (latitude/longitude) when you are "online" and during active jobs. Collected via <code>expo-location</code> with foreground permission. Updates every 20 metres of movement or every 30 seconds as a heartbeat.</td>
          <td>Job matching based on proximity, live tracking for clients, arrival detection, dispatch radius filtering</td>
        </tr>
        <tr>
          <td><strong>Device Information</strong></td>
          <td>Device platform (iOS/Android), app version, Expo project ID</td>
          <td>Bug reports, compatibility, push notification delivery</td>
        </tr>
        <tr>
          <td><strong>Push Notification Token</strong></td>
          <td>Expo Push Token (device-specific identifier for push notifications)</td>
          <td>Delivering real-time notifications about jobs, messages, and account updates</td>
        </tr>
        <tr>
          <td><strong>Authentication Tokens</strong></td>
          <td>JWT access and refresh tokens stored locally on your device (via AsyncStorage or in-memory depending on "Remember Me" preference)</td>
          <td>Maintaining authenticated sessions</td>
        </tr>
      </table>

      <h3>2.3 Information We Do NOT Collect</h3>
      <ul>
        <li>We do <strong>not</strong> use any third-party analytics SDKs (such as Firebase Analytics, Mixpanel, or Amplitude) in the mobile app.</li>
        <li>We do <strong>not</strong> access your device contacts, calendar, microphone, or files beyond what you explicitly provide.</li>
        <li>We do <strong>not</strong> use advertising trackers or sell your data to advertisers.</li>
        <li>We do <strong>not</strong> perform cross-app or cross-site tracking.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your personal information for the following purposes:</p>
      <ol>
        <li><strong>Service Delivery</strong> — Creating and managing your account, matching you with jobs, facilitating communication between tradies and clients, and processing payments.</li>
        <li><strong>Location-Based Services</strong> — Using your GPS coordinates to find nearby jobs within your service radius, providing live tracking to clients when you are en route, and detecting arrival at the job site.</li>
        <li><strong>Payment Processing</strong> — Processing job payments, managing escrow holds, calculating platform commissions, and facilitating payouts to your bank account via Stripe Connect.</li>
        <li><strong>Verification &amp; Compliance</strong> — Verifying your identity, trade qualifications, and compliance documents (ABN, licences, insurance) to maintain trust and safety on the platform.</li>
        <li><strong>Communication</strong> — Sending transactional notifications (job dispatches, status updates, completion OTPs), in-app messages, emails, and SMS related to your jobs and account.</li>
        <li><strong>Safety &amp; Dispute Resolution</strong> — Using job completion photos, chat records, and scope change records to resolve disputes between tradies and clients.</li>
        <li><strong>Service Improvement</strong> — Using bug reports and general usage patterns to identify and fix issues, and to improve the App and Platform.</li>
        <li><strong>Legal Compliance</strong> — Meeting our obligations under Australian law, including tax reporting, anti-money laundering requirements, and responding to lawful requests from authorities.</li>
      </ol>

      <h2>4. How We Share Your Information</h2>
      <p>We do <strong>not</strong> sell your personal information. We share information only as follows:</p>

      <h3>4.1 With Other Users</h3>
      <ul>
        <li><strong>Clients</strong> see your name, trade category, rating, and real-time location (only when en route to or performing their job).</li>
        <li><strong>Tradies</strong> see the client's name, job location (suburb and state — full address only after acceptance), and job details.</li>
      </ul>

      <h3>4.2 With Third-Party Service Providers</h3>
      <table>
        <tr><th>Provider</th><th>Country</th><th>Purpose</th><th>Data Shared</th></tr>
        <tr>
          <td><strong>Stripe</strong> (Stripe Payments Australia Pty Ltd)</td>
          <td>Australia (primary), USA (infrastructure)</td>
          <td>Payment processing, payout management, identity verification (KYC)</td>
          <td>Name, email, date of birth, address, BSB, account number, ID document images</td>
        </tr>
        <tr>
          <td><strong>Twilio</strong> (Twilio Inc.)</td>
          <td>USA</td>
          <td>SMS delivery (job notifications, completion OTPs, tracking links)</td>
          <td>Phone number, SMS content</td>
        </tr>
        <tr>
          <td><strong>Cloudinary</strong> (Cloudinary Ltd.)</td>
          <td>India (current), subject to change</td>
          <td>Image and document hosting (job photos, completion photos, compliance documents, dispute evidence)</td>
          <td>Uploaded images and documents</td>
        </tr>
        <tr>
          <td><strong>Expo</strong> (Expo Inc.)</td>
          <td>USA</td>
          <td>Push notification delivery via Expo Push API</td>
          <td>Expo Push Token, notification title and body</td>
        </tr>
        <tr>
          <td><strong>MongoDB Atlas</strong></td>
          <td>USA (Virginia)</td>
          <td>Primary database — stores account data, job records, messages, notifications</td>
          <td>All account and job data as described in Section 2</td>
        </tr>
        <tr>
          <td><strong>Redis</strong> (via Render hosting)</td>
          <td>USA (Virginia)</td>
          <td>Real-time caching — temporary location data, pending notification queues, session data</td>
          <td>Location coordinates (temporary), notification payloads</td>
        </tr>
        <tr>
          <td><strong>Render</strong> (Render Inc.)</td>
          <td>USA (Virginia)</td>
          <td>Backend server hosting</td>
          <td>All server-side data in transit and at rest</td>
        </tr>
        <tr>
          <td><strong>SMTP Email Provider</strong></td>
          <td>Varies</td>
          <td>Transactional email delivery (verification, password resets, job updates, OTPs)</td>
          <td>Email address, email content</td>
        </tr>
      </table>

      <div class="warning-box">
        <p><strong>Overseas Disclosure:</strong> Some of our service providers are located outside Australia
        (primarily the United States and India). By using our Services, you consent to the transfer of your
        personal information to these countries. We take reasonable steps to ensure that overseas recipients
        handle your information in accordance with the Australian Privacy Principles.</p>
      </div>

      <h3>4.3 Legal Disclosures</h3>
      <p>We may disclose your personal information if required by law, regulation, legal process, or governmental request, including to:</p>
      <ul>
        <li>Comply with a court order, subpoena, or similar legal obligation</li>
        <li>Cooperate with law enforcement or government authorities</li>
        <li>Protect the rights, property, or safety of Fixes, our users, or the public</li>
        <li>Report to the Office of the Australian Information Commissioner (OAIC) in the event of a notifiable data breach</li>
      </ul>

      <h2>5. Device Permissions</h2>
      <p>The App requests the following device permissions. All permissions are requested at runtime with clear explanations:</p>
      <table>
        <tr><th>Permission</th><th>When Requested</th><th>Why Required</th></tr>
        <tr>
          <td><strong>Location (Foreground)</strong></td>
          <td>When you go "online" or open the map</td>
          <td>Job matching, live tracking, arrival detection. Location is shared via Socket.IO (not HTTP) and cached in Redis with a 60-second debounce to MongoDB.</td>
        </tr>
        <tr>
          <td><strong>Camera</strong></td>
          <td>When completing a job (work photos)</td>
          <td>Capturing watermarked completion photos as proof of work</td>
        </tr>
        <tr>
          <td><strong>Photo Library</strong></td>
          <td>When uploading dispute evidence</td>
          <td>Selecting existing photos to submit as evidence in disputes</td>
        </tr>
        <tr>
          <td><strong>Push Notifications</strong></td>
          <td>On first login</td>
          <td>Receiving real-time job dispatches, status updates, and messages</td>
        </tr>
      </table>
      <p>You can revoke any permission at any time via your device's Settings. Revoking location permission will prevent you from receiving job dispatches.</p>

      <h2>6. Data Storage &amp; Security</h2>

      <h3>6.1 Where Your Data Is Stored</h3>
      <ul>
        <li><strong>Server-side:</strong> Our backend is hosted on Render (Virginia, USA). Database is MongoDB Atlas (USA). We plan to migrate to an Australian data centre when feasible.</li>
        <li><strong>On-device:</strong> Authentication tokens and user profile cache are stored locally using React Native AsyncStorage (encrypted at the OS level on both iOS and Android). When "Remember Me" is disabled, tokens are stored in memory only and are cleared when the app is closed.</li>
      </ul>

      <h3>6.2 Security Measures</h3>
      <ul>
        <li><strong>Encryption in Transit:</strong> All API communications use HTTPS/TLS. WebSocket connections use WSS.</li>
        <li><strong>Password Security:</strong> Passwords are hashed with bcrypt (12 rounds) and never stored in plain text.</li>
        <li><strong>JWT Authentication:</strong> Access tokens are short-lived. Refresh tokens are rotated on each use.</li>
        <li><strong>OTP Security:</strong> Job completion OTPs are hashed before storage and expire after 15 minutes.</li>
        <li><strong>API Rate Limiting:</strong> 500 requests per 15 minutes (general), 100 per 15 minutes (auth endpoints) to prevent brute-force attacks.</li>
        <li><strong>Input Validation:</strong> All inputs are validated and sanitised server-side.</li>
        <li><strong>Sensitive Fields:</strong> Password hashes, refresh tokens, reset tokens, and OTP hashes are excluded from API responses using Mongoose <code>select: false</code>.</li>
        <li><strong>Helmet.js:</strong> HTTP security headers are applied to all responses.</li>
      </ul>

      <h2>7. Data Retention</h2>
      <p>We retain your personal information in accordance with the following schedule:</p>
      <table>
        <tr><th>Data Type</th><th>Retention Period</th><th>Basis</th></tr>
        <tr>
          <td>Account information</td>
          <td>Duration of account + 2 years after deletion request</td>
          <td>Legal obligations, dispute resolution</td>
        </tr>
        <tr>
          <td>Job records &amp; payment history</td>
          <td>7 years from completion</td>
          <td>Australian tax law (ATO record-keeping requirements)</td>
        </tr>
        <tr>
          <td>Chat messages</td>
          <td>2 years after job completion</td>
          <td>Dispute resolution</td>
        </tr>
        <tr>
          <td>Completion &amp; dispute photos</td>
          <td>2 years after job completion</td>
          <td>Evidence preservation</td>
        </tr>
        <tr>
          <td>Compliance documents</td>
          <td>Duration of account + 2 years</td>
          <td>Regulatory compliance, audit trail</td>
        </tr>
        <tr>
          <td>Location data (real-time)</td>
          <td>Cached in Redis for the active session; persisted to MongoDB with each update, overwriting the previous entry</td>
          <td>Operational necessity</td>
        </tr>
        <tr>
          <td>Push notification tokens</td>
          <td>Until token becomes invalid or account is deleted</td>
          <td>Service delivery</td>
        </tr>
        <tr>
          <td>Bug reports</td>
          <td>1 year</td>
          <td>Service improvement</td>
        </tr>
      </table>
      <p>After the retention period expires, data is securely deleted or permanently de-identified in accordance with APP 11.2.</p>

      <h2>8. Your Rights</h2>
      <p>Under the Australian Privacy Act 1988 and the APPs, you have the following rights:</p>
      <ul>
        <li><strong>Access (APP 12):</strong> You may request access to the personal information we hold about you.</li>
        <li><strong>Correction (APP 13):</strong> You may request correction of any inaccurate, out-of-date, or incomplete personal information. You can also update your profile, phone number, bio, service radius, and categories directly in the App's Settings screen.</li>
        <li><strong>Deletion:</strong> You may request deletion of your account and associated data. We will process your request within 30 days, subject to any legal retention obligations (see Section 7).</li>
        <li><strong>Withdraw Consent:</strong> You may withdraw consent for optional data processing (e.g., push notifications, location tracking) by revoking device permissions or contacting us.</li>
        <li><strong>Complaint:</strong> If you believe we have breached the APPs, you may lodge a complaint with us (see Section 12) or with the <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noopener">Office of the Australian Information Commissioner (OAIC)</a>.</li>
      </ul>
      <p>To exercise any of these rights, please contact us at <span class="placeholder">contact@fixesau.com</span>.</p>

      <h2>9. Cookies &amp; Local Storage</h2>
      <p>
        The mobile App does <strong>not</strong> use cookies. We use React Native AsyncStorage to store
        authentication tokens and cached user profile data locally on your device. This data is not shared
        with any third party and is cleared when you log out or delete the app.
      </p>
      <p>
        Our web platform (<a href="https://www.fixesau.com">fixesau.com</a>) uses Vercel Analytics for
        anonymised, aggregate website performance metrics. No personally identifiable information is collected
        by this service on the web platform.
      </p>

      <h2>10. Notifiable Data Breaches</h2>
      <p>
        In the event of a data breach that is likely to result in serious harm to any individual whose
        personal information is involved, we will:
      </p>
      <ol>
        <li>Notify the <strong>Office of the Australian Information Commissioner (OAIC)</strong> as soon as practicable.</li>
        <li>Notify affected individuals with details of the breach, the type of information involved, and recommended steps they should take.</li>
        <li>Take all reasonable steps to contain the breach and mitigate any resulting harm.</li>
      </ol>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
        legal requirements, or other factors. When we make material changes, we will:
      </p>
      <ul>
        <li>Update the "Last Updated" date at the top of this page</li>
        <li>Send an in-app notification or push notification to inform you of the changes</li>
        <li>Where required by law, seek your consent before applying changes that significantly affect how your personal information is handled</li>
      </ul>
      <p>We encourage you to review this Privacy Policy periodically.</p>

      <h2>12. Contact Us</h2>
      <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
      <ul>
        <li><strong>Entity:</strong> <span class="placeholder">fixesau</span></li>
        <li><strong>ABN:</strong> <span class="placeholder">52697058503</span></li>
        <li><strong>Email:</strong> <span class="placeholder">contact@fixesau.com</span></li>
        <li><strong>Address:</strong> <span class="placeholder">86-88 St Helens Crescent, NARRE WARREN NORTH VIC 3804</span></li>
      </ul>
      <p>
        If you are not satisfied with our response, you may lodge a complaint with the
        <a href="https://www.oaic.gov.au" target="_blank" rel="noopener">Office of the Australian Information Commissioner (OAIC)</a>:
      </p>
      <ul>
        <li><strong>Phone:</strong> 1300 363 992</li>
        <li><strong>Website:</strong> <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noopener">oaic.gov.au/privacy/privacy-complaints</a></li>
      </ul>

      <h2>13. Apple App Store &amp; Google Play Store Disclosures</h2>

      <h3>13.1 Data Collected (App Store Privacy Nutrition Label / Play Store Data Safety)</h3>
      <table>
        <tr><th>Category</th><th>Data Type</th><th>Linked to Identity</th><th>Used for Tracking</th></tr>
        <tr><td>Contact Info</td><td>Name, Email, Phone</td><td>Yes</td><td>No</td></tr>
        <tr><td>Location</td><td>Precise Location (GPS)</td><td>Yes</td><td>No</td></tr>
        <tr><td>Financial Info</td><td>Payment Info (via Stripe), Bank Details</td><td>Yes</td><td>No</td></tr>
        <tr><td>Identifiers</td><td>User ID, Expo Push Token</td><td>Yes</td><td>No</td></tr>
        <tr><td>Photos &amp; Videos</td><td>Job completion photos, document uploads, dispute evidence</td><td>Yes</td><td>No</td></tr>
        <tr><td>User Content</td><td>Chat messages, bug reports, profile bio</td><td>Yes</td><td>No</td></tr>
        <tr><td>Sensitive Info</td><td>Government ID (processed by Stripe only)</td><td>Yes</td><td>No</td></tr>
      </table>

      <h3>13.2 Data NOT Collected</h3>
      <ul>
        <li>Health &amp; Fitness data</li>
        <li>Browsing History</li>
        <li>Search History</li>
        <li>Contacts / Address Book</li>
        <li>Diagnostics / Crash Logs (no analytics SDK)</li>
        <li>Advertising Data / Ad Identifiers</li>
      </ul>

      <h3>13.3 Data Deletion</h3>
      <p>
        Users can request account and data deletion by contacting us at
        <span class="placeholder">contact@fixesau.com</span>.
        Deletion requests are processed within 30 days, subject to legal retention requirements outlined in Section 7.
      </p>

    </div>
  `

  return (
    <main className="min-h-screen bg-[#FFFCE9]">
      <Header />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <Footer />
    </main>
  )
}
