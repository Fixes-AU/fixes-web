import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Privacy Policy — Fixes Client App',
  description: 'Privacy Policy for the Fixes Client mobile application. Learn how we collect, use, and protect your personal information.',
}

export default function ClientPrivacyPolicyPage() {
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
        <p>Fixes — Client Mobile Application &amp; Platform</p>
      </div>

      <div class="effective">
        <strong>Effective Date:</strong> <span class="placeholder">1 June 2026</span> &nbsp;|&nbsp;
        <strong>Last Updated:</strong> 1 June 2026
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
        when you use our App, Platform, and related services (collectively, the "Services") as a <strong>Client</strong>
        (a homeowner or property manager seeking trade services).
        We are committed to complying with the <strong>Australian Privacy Act 1988</strong> (Cth)
        and the <strong>Australian Privacy Principles</strong> (APPs), as well as the
        <strong>New Zealand Privacy Act 2020</strong> and the privacy requirements
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
          <td>Full name, email address, phone number, password (stored as bcrypt hash on our servers — never in plain text)</td>
          <td>Account creation, authentication, communication</td>
        </tr>
        <tr>
          <td><strong>Profile Information</strong></td>
          <td>Avatar photo (optional), display name</td>
          <td>Personalisation, identity within in-app chat</td>
        </tr>
        <tr>
          <td><strong>Job Details</strong></td>
          <td>Job title, description, trade category, preferred timing, scheduled date/time, diagnostic question answers</td>
          <td>AI-powered quote generation, tradie matching, job fulfilment</td>
        </tr>
        <tr>
          <td><strong>Job Photos</strong></td>
          <td>Photos of the issue or work area (up to 5 per job, captured via camera or selected from photo library)</td>
          <td>AI quote accuracy, tradie context, dispute evidence</td>
        </tr>
        <tr>
          <td><strong>Location (Manual)</strong></td>
          <td>Street address, suburb, postcode, state — entered manually or via Google Places autocomplete</td>
          <td>Setting the job site location, matching nearby tradies</td>
        </tr>
        <tr>
          <td><strong>Payment Information</strong></td>
          <td>Payment card details (processed entirely by Stripe — <strong>never stored on our servers</strong>)</td>
          <td>Paying for jobs (escrow), scope change top-ups</td>
        </tr>
        <tr>
          <td><strong>Messages</strong></td>
          <td>Text messages sent within job chat</td>
          <td>Communication with assigned tradies, dispute resolution</td>
        </tr>
        <tr>
          <td><strong>Reviews</strong></td>
          <td>Star rating and written review for completed jobs</td>
          <td>Quality assurance, tradie accountability</td>
        </tr>
        <tr>
          <td><strong>Dispute Evidence</strong></td>
          <td>Photos and text descriptions submitted when raising or responding to a dispute</td>
          <td>Fair dispute resolution by our admin team</td>
        </tr>
      </table>

      <h3>2.2 Information Collected Automatically</h3>
      <table>
        <tr><th>Data Category</th><th>Specific Data Collected</th><th>Purpose</th></tr>
        <tr>
          <td><strong>Location Data (GPS)</strong></td>
          <td>Device GPS coordinates collected via <code>expo-location</code> with foreground permission — only when you tap "Use Current Location" during job posting. This is a <strong>one-time read</strong>, not continuous tracking.</td>
          <td>Auto-filling your job address</td>
        </tr>
        <tr>
          <td><strong>Device Information</strong></td>
          <td>Device platform (iOS/Android), app version</td>
          <td>Compatibility, push notification delivery</td>
        </tr>
        <tr>
          <td><strong>Push Notification Token</strong></td>
          <td>Expo Push Token (device-specific identifier)</td>
          <td>Delivering real-time notifications about job updates, messages, and quote results</td>
        </tr>
        <tr>
          <td><strong>Authentication Tokens</strong></td>
          <td>JWT access and refresh tokens stored locally on your device (via AsyncStorage or in-memory depending on "Remember Me" preference)</td>
          <td>Maintaining authenticated sessions</td>
        </tr>
        <tr>
          <td><strong>Cached Profile</strong></td>
          <td>A local copy of your user profile (name, email, avatar URL) cached in AsyncStorage</td>
          <td>Faster app startup, offline display</td>
        </tr>
      </table>

      <h3>2.3 Information We Do NOT Collect</h3>
      <ul>
        <li>We do <strong>not</strong> continuously track your location. GPS is read only once when you explicitly tap "Use Current Location".</li>
        <li>We do <strong>not</strong> use any third-party analytics SDKs (such as Firebase Analytics, Mixpanel, or Amplitude) in the mobile app.</li>
        <li>We do <strong>not</strong> access your device contacts, calendar, microphone, or files beyond what you explicitly provide.</li>
        <li>We do <strong>not</strong> use advertising trackers or sell your data to advertisers.</li>
        <li>We do <strong>not</strong> perform cross-app or cross-site tracking.</li>
        <li>We do <strong>not</strong> collect health, fitness, or biometric data.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your personal information for the following purposes:</p>
      <ol>
        <li><strong>Service Delivery</strong> — Creating and managing your account, generating AI-powered quotes for your jobs, matching you with verified tradies, and facilitating communication.</li>
        <li><strong>AI-Powered Quoting</strong> — Your job title, description, photos, location, and diagnostic answers are processed by our AI engine to generate personalised, tiered price quotes (Junior / Senior / Specialist).</li>
        <li><strong>Job Classification</strong> — Your job description text is analysed using on-device keyword matching and (when confidence is low) a server-side AI classifier to suggest the appropriate trade category.</li>
        <li><strong>Location Services</strong> — Using your GPS coordinates (when you tap "Use Current Location") to auto-fill your job address, and using the job address to find nearby tradies and calculate routes.</li>
        <li><strong>Payment Processing</strong> — Processing job payments via Stripe, holding funds in escrow until job completion, processing refunds for cancellations, and handling scope-change top-up payments.</li>
        <li><strong>Live Tracking</strong> — Displaying the assigned tradie's real-time location on a map when they are en route to your job (tradie location is shared by the tradie app, not yours).</li>
        <li><strong>Communication</strong> — Sending push notifications (quote ready, tradie assigned, tradie en route, job completed), in-app messages, and emails (verification, password resets).</li>
        <li><strong>Safety &amp; Dispute Resolution</strong> — Using job photos, chat records, completion photos, and dispute evidence to mediate disputes fairly.</li>
        <li><strong>Service Improvement</strong> — Using general usage patterns to improve the App and Platform.</li>
        <li><strong>Legal Compliance</strong> — Meeting our obligations under Australian and New Zealand law, including tax reporting and responding to lawful requests from authorities.</li>
      </ol>

      <h2>4. How We Share Your Information</h2>
      <p>We do <strong>not</strong> sell your personal information. We share information only as follows:</p>

      <h3>4.1 With Other Users</h3>
      <ul>
        <li><strong>Tradies</strong> assigned to your job can see your name, job location (suburb and state initially — full address after they accept the dispatch), job details, photos, and chat messages.</li>
        <li><strong>Tradies</strong> can also see your star rating and review after job completion.</li>
        <li>Your email, phone number, and payment details are <strong>never</strong> shared with tradies.</li>
      </ul>

      <h3>4.2 With Third-Party Service Providers</h3>
      <table>
        <tr><th>Provider</th><th>Country</th><th>Purpose</th><th>Data Shared</th></tr>
        <tr>
          <td><strong>Stripe</strong> (Stripe Payments Australia Pty Ltd)</td>
          <td>Australia (primary), USA (infrastructure)</td>
          <td>Payment processing, escrow management</td>
          <td>Name, email, payment card details (card details handled entirely by Stripe SDK — never touch our servers)</td>
        </tr>
        <tr>
          <td><strong>Google Maps Platform</strong></td>
          <td>USA</td>
          <td>Address autocomplete (Places API), live tradie route display (Routes API), map rendering</td>
          <td>Address search queries, job location coordinates</td>
        </tr>
        <tr>
          <td><strong>Nominatim (OpenStreetMap)</strong></td>
          <td>Various</td>
          <td>Fallback geocoding when Google coordinates are unavailable</td>
          <td>Address string for geocoding</td>
        </tr>
        <tr>
          <td><strong>Cloudinary</strong> (Cloudinary Ltd.)</td>
          <td>USA</td>
          <td>Image hosting (job photos, avatar photos, dispute evidence)</td>
          <td>Uploaded images</td>
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
          <td><strong>Render</strong> (Render Inc.)</td>
          <td>USA (Virginia)</td>
          <td>Backend server hosting</td>
          <td>All server-side data in transit and at rest</td>
        </tr>
        <tr>
          <td><strong>SMTP Email Provider</strong></td>
          <td>Varies</td>
          <td>Transactional email delivery (verification, password resets)</td>
          <td>Email address, email content</td>
        </tr>
      </table>

      <div class="warning-box">
        <p><strong>Overseas Disclosure:</strong> Some of our service providers are located outside Australia
        (primarily the United States). By using our Services, you consent to the transfer of your
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
          <td>When you tap "Use Current Location" while posting a job</td>
          <td>One-time GPS read to auto-fill your job address. We do <strong>not</strong> continuously track your location.</td>
        </tr>
        <tr>
          <td><strong>Camera</strong></td>
          <td>When you tap the camera button while adding job photos</td>
          <td>Capturing photos of the issue or work area to attach to your job post</td>
        </tr>
        <tr>
          <td><strong>Photo Library</strong></td>
          <td>When you tap the gallery button while adding job photos, uploading an avatar, or submitting dispute evidence</td>
          <td>Selecting existing photos from your device to upload</td>
        </tr>
        <tr>
          <td><strong>Push Notifications</strong></td>
          <td>On first login</td>
          <td>Receiving real-time updates about quotes, tradie assignments, arrival notifications, job completion, and messages</td>
        </tr>
      </table>
      <p>You can revoke any permission at any time via your device's Settings. Revoking location permission will require you to enter your job address manually. Revoking notification permission means you will not receive real-time updates.</p>

      <h2>6. Data Storage &amp; Security</h2>

      <h3>6.1 Where Your Data Is Stored</h3>
      <ul>
        <li><strong>Server-side:</strong> Our backend is hosted on Render (Virginia, USA). Database is MongoDB Atlas (USA). We plan to migrate to an Australian data centre when feasible.</li>
        <li><strong>On-device:</strong> Authentication tokens and user profile cache are stored locally using React Native AsyncStorage (encrypted at the OS level on both iOS and Android). When "Remember Me" is disabled, tokens are stored in memory only and are cleared when the app is closed.</li>
        <li><strong>Images:</strong> Job photos, avatar photos, and dispute evidence are stored on Cloudinary's CDN.</li>
      </ul>

      <h3>6.2 Security Measures</h3>
      <ul>
        <li><strong>Encryption in Transit:</strong> All API communications use HTTPS/TLS. WebSocket connections (for real-time chat and tracking) use WSS.</li>
        <li><strong>Password Security:</strong> Passwords are hashed with bcrypt (12 rounds) and never stored in plain text.</li>
        <li><strong>JWT Authentication:</strong> Access tokens are short-lived. Refresh tokens are rotated on each use.</li>
        <li><strong>Payment Security:</strong> All payment card data is handled exclusively by the Stripe SDK and Stripe's PCI-DSS compliant infrastructure. Card details never pass through or are stored on our servers.</li>
        <li><strong>API Rate Limiting:</strong> Rate limits are enforced on all endpoints to prevent brute-force attacks.</li>
        <li><strong>Input Validation:</strong> All inputs are validated and sanitised server-side.</li>
        <li><strong>Sensitive Fields:</strong> Password hashes, refresh tokens, and reset tokens are excluded from API responses.</li>
        <li><strong>Secure Uploads:</strong> All image uploads to Cloudinary use signed upload requests with time-limited signatures generated server-side.</li>
      </ul>

      <h2>7. Data Retention</h2>
      <p>We retain your personal information in accordance with the following schedule:</p>
      <table>
        <tr><th>Data Type</th><th>Retention Period</th><th>Basis</th></tr>
        <tr><td>Account information</td><td>Duration of account + 2 years after deletion request</td><td>Legal obligations, dispute resolution</td></tr>
        <tr><td>Job records &amp; payment history</td><td>7 years from completion</td><td>Australian tax law (ATO record-keeping requirements)</td></tr>
        <tr><td>Chat messages</td><td>2 years after job completion</td><td>Dispute resolution</td></tr>
        <tr><td>Job photos &amp; dispute evidence</td><td>2 years after job completion</td><td>Evidence preservation</td></tr>
        <tr><td>Reviews</td><td>Duration of account + 2 years</td><td>Platform integrity</td></tr>
        <tr><td>Push notification tokens</td><td>Until token becomes invalid or account is deleted</td><td>Service delivery</td></tr>
      </table>
      <p>After the retention period expires, data is securely deleted or permanently de-identified in accordance with APP 11.2.</p>

      <h2>8. Your Rights</h2>
      <p>Under the Australian Privacy Act 1988, the APPs, and the New Zealand Privacy Act 2020, you have the following rights:</p>
      <ul>
        <li><strong>Access (APP 12):</strong> You may request access to the personal information we hold about you.</li>
        <li><strong>Correction (APP 13):</strong> You may request correction of any inaccurate, out-of-date, or incomplete personal information. You can also update your name and phone number directly in the App's Profile screen.</li>
        <li><strong>Deletion:</strong> You may request deletion of your account and associated data via the App's Settings &gt; Delete Account screen or by contacting us. We will process your request within 30 days, subject to any legal retention obligations (see Section 7). Account deletion is <strong>permanent and irreversible</strong>.</li>
        <li><strong>Withdraw Consent:</strong> You may withdraw consent for optional data processing (e.g., push notifications, location) by revoking device permissions or contacting us.</li>
        <li><strong>Complaint:</strong> If you believe we have breached the APPs, you may lodge a complaint with us (see Section 11) or with the <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noopener">Office of the Australian Information Commissioner (OAIC)</a>. New Zealand residents may also contact the <a href="https://www.privacy.org.nz" target="_blank" rel="noopener">NZ Office of the Privacy Commissioner</a>.</li>
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
      <p>In the event of a data breach that is likely to result in serious harm to any individual whose personal information is involved, we will:</p>
      <ol>
        <li>Notify the <strong>Office of the Australian Information Commissioner (OAIC)</strong> as soon as practicable.</li>
        <li>Notify affected individuals with details of the breach, the type of information involved, and recommended steps they should take.</li>
        <li>Take all reasonable steps to contain the breach and mitigate any resulting harm.</li>
      </ol>

      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. When we make material changes, we will:</p>
      <ul>
        <li>Update the "Last Updated" date at the top of this page</li>
        <li>Send an in-app notification or push notification to inform you of the changes</li>
        <li>Where required by law, seek your consent before applying changes that significantly affect how your personal information is handled</li>
      </ul>

      <h2>12. Contact Us</h2>
      <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
      <ul>
        <li><strong>Entity:</strong> <span class="placeholder">fixesau</span></li>
        <li><strong>ABN:</strong> <span class="placeholder">52697058503</span></li>
        <li><strong>Email:</strong> <span class="placeholder">contact@fixesau.com</span></li>
        <li><strong>Address:</strong> <span class="placeholder">86-88 St Helens Crescent, NARRE WARREN NORTH VIC 3804</span></li>
      </ul>
      <p>If you are not satisfied with our response, you may lodge a complaint with the
        <a href="https://www.oaic.gov.au" target="_blank" rel="noopener">Office of the Australian Information Commissioner (OAIC)</a>:</p>
      <ul>
        <li><strong>Phone:</strong> 1300 363 992</li>
        <li><strong>Website:</strong> <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noopener">oaic.gov.au/privacy/privacy-complaints</a></li>
      </ul>
      <p>New Zealand residents may also contact the <a href="https://www.privacy.org.nz/your-rights/making-a-complaint/" target="_blank" rel="noopener">NZ Office of the Privacy Commissioner</a>.</p>

      <h2>13. Apple App Store &amp; Google Play Store Disclosures</h2>

      <h3>13.1 Data Collected (App Store Privacy Nutrition Label / Play Store Data Safety)</h3>
      <table>
        <tr><th>Category</th><th>Data Type</th><th>Linked to Identity</th><th>Used for Tracking</th></tr>
        <tr><td>Contact Info</td><td>Name, Email, Phone (optional)</td><td>Yes</td><td>No</td></tr>
        <tr><td>Location</td><td>Precise Location (one-time GPS read)</td><td>Yes</td><td>No</td></tr>
        <tr><td>Financial Info</td><td>Payment Info (via Stripe SDK)</td><td>Yes</td><td>No</td></tr>
        <tr><td>Identifiers</td><td>User ID, Expo Push Token</td><td>Yes</td><td>No</td></tr>
        <tr><td>Photos</td><td>Job photos, avatar, dispute evidence</td><td>Yes</td><td>No</td></tr>
        <tr><td>User Content</td><td>Chat messages, job descriptions, reviews</td><td>Yes</td><td>No</td></tr>
      </table>

      <h3>13.2 Data NOT Collected</h3>
      <ul>
        <li>Health &amp; Fitness data</li>
        <li>Browsing History</li>
        <li>Search History</li>
        <li>Contacts / Address Book</li>
        <li>Diagnostics / Crash Logs (no analytics SDK)</li>
        <li>Advertising Data / Ad Identifiers</li>
        <li>Sensitive Info / Government ID (not required for clients)</li>
      </ul>

      <h3>13.3 Data Deletion</h3>
      <p>
        Users can request account and data deletion directly within the App via <strong>Settings &gt; Delete Account</strong>,
        or by contacting us at <span class="placeholder">contact@fixesau.com</span>.
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
