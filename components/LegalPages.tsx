import React from 'react';
import { Shield, Lock, Server, Mail, FileText, AlertTriangle } from 'lucide-react';

// --- PRIVACY POLICY ---
export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-900/30">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: January 2025</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 md:p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">1. Introduction</h2>
          <p>
            SRO Software Limited ("we", "us", "our"), trading as SpookyEmail, is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our email
            generation service at spookyemail.com.
          </p>
          <p className="mt-2">
            <strong>Company Details:</strong><br />
            SRO Software Limited<br />
            Warrenstown House, Warrenstown, Dunboyne, Co. Meath, Ireland<br />
            Company Registration No: 575907
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">2. Data We Collect</h2>
          <p className="mb-2">We collect the following types of data:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-300">Email Address:</strong> When you make a purchase, we collect your email to deliver results</li>
            <li><strong className="text-slate-300">CSV Contact Data:</strong> The contact data you upload for email generation</li>
            <li><strong className="text-slate-300">Email Templates:</strong> The prompts and templates you create</li>
            <li><strong className="text-slate-300">Payment Information:</strong> Processed securely by Stripe (we never see full card details)</li>
            <li><strong className="text-slate-300">Usage Analytics:</strong> Anonymous usage data via PostHog to improve our service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">3. How We Process Your Data</h2>
          <p className="mb-2"><strong>Free Tier (Your Own API Key):</strong></p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 mb-4">
            <li>Your CSV data is processed entirely in your browser</li>
            <li>Data is sent directly to Google's Gemini API using YOUR API key</li>
            <li>We never see, store, or have access to your contact data</li>
            <li>No data leaves your browser to our servers</li>
          </ul>
          <p className="mb-2"><strong>Paid Tier:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Your CSV data is temporarily stored on our secure servers for processing</li>
            <li>Data is processed using our Gemini API key on Cloudflare Workers</li>
            <li>Results are emailed to you and then deleted from our servers</li>
            <li>We do not retain your contact data after delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">4. Data Retention</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-300">Free Tier:</strong> No data is stored - everything is processed in your browser</li>
            <li><strong className="text-slate-300">Paid Orders:</strong> Order metadata retained for 90 days for support purposes</li>
            <li><strong className="text-slate-300">Contact Data:</strong> Deleted immediately after email delivery</li>
            <li><strong className="text-slate-300">Payment Records:</strong> Retained as required by law (typically 7 years)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">5. GDPR Compliance</h2>
          <p className="mb-2">Under GDPR, you have the following rights:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-300">Right to Access:</strong> Request a copy of your personal data</li>
            <li><strong className="text-slate-300">Right to Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong className="text-slate-300">Right to Erasure:</strong> Request deletion of your data</li>
            <li><strong className="text-slate-300">Right to Portability:</strong> Receive your data in a portable format</li>
            <li><strong className="text-slate-300">Right to Object:</strong> Object to processing of your data</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@spookyemail.com" className="text-orange-400 hover:text-orange-300">privacy@spookyemail.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">6. Security Measures</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>256-bit SSL/TLS encryption for all data in transit</li>
            <li>Data encrypted at rest using AES-256</li>
            <li>Hosted on Cloudflare's global edge network</li>
            <li>Database hosted on Neon with automatic encryption</li>
            <li>No plain-text storage of sensitive information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">7. Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-300">Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
            <li><strong className="text-slate-300">Google Gemini:</strong> AI email generation</li>
            <li><strong className="text-slate-300">Postmark:</strong> Transactional email delivery</li>
            <li><strong className="text-slate-300">PostHog:</strong> Privacy-friendly analytics</li>
            <li><strong className="text-slate-300">Cloudflare:</strong> Hosting and security</li>
            <li><strong className="text-slate-300">Neon:</strong> Database hosting</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">8. Cookies</h2>
          <p>
            We use minimal cookies for essential functionality only. We do not use tracking cookies for advertising.
            PostHog analytics respects Do Not Track settings and is configured for privacy-friendly tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">9. Contact Us</h2>
          <p>
            For privacy-related inquiries:<br />
            Email: <a href="mailto:privacy@spookyemail.com" className="text-orange-400 hover:text-orange-300">privacy@spookyemail.com</a><br />
            Address: SRO Software Limited, Warrenstown House, Warrenstown, Dunboyne, Co. Meath, Ireland
          </p>
        </section>
      </div>
    </div>
  );
};

// --- TERMS OF SERVICE ---
export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-900/30">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-slate-400">Last updated: January 2025</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 md:p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using SpookyEmail (the "Service"), operated by SRO Software Limited, you agree to be bound
            by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">2. Description of Service</h2>
          <p>
            SpookyEmail is an AI-powered email generation platform that creates personalized email sequences
            based on your contact data and templates. The Service uses Google's Gemini AI to generate content.
          </p>
        </section>

        <section className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            3. Acceptable Use Policy
          </h2>
          <p className="mb-3 text-red-300">You agree NOT to use SpookyEmail for:</p>
          <ul className="list-disc list-inside space-y-1 text-red-300/80">
            <li><strong>Spam:</strong> Sending unsolicited bulk emails or messages</li>
            <li><strong>Phishing:</strong> Creating deceptive emails to steal credentials or personal information</li>
            <li><strong>Harassment:</strong> Sending threatening, abusive, or harassing content</li>
            <li><strong>Fraud:</strong> Creating emails for scams, cons, or fraudulent schemes</li>
            <li><strong>Malware Distribution:</strong> Emails containing or linking to malicious software</li>
            <li><strong>Illegal Activities:</strong> Any use that violates local, national, or international law</li>
            <li><strong>Impersonation:</strong> Falsely representing yourself or your organization</li>
            <li><strong>Data Harvesting:</strong> Collecting email addresses without consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">4. User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>You are solely responsible for the content you create using our Service</li>
            <li>You must have proper consent to contact individuals in your uploaded contact lists</li>
            <li>You must comply with all applicable email regulations including GDPR, CAN-SPAM, CASL, and others</li>
            <li>You are responsible for maintaining appropriate unsubscribe mechanisms in your campaigns</li>
            <li>You must not upload contact lists obtained through scraping or purchased without consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">5. Account Termination</h2>
          <p className="mb-2">We reserve the right to immediately terminate or suspend access to our Service, without prior notice, for:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Violation of these Terms of Service</li>
            <li>Violation of the Acceptable Use Policy</li>
            <li>Reports of spam or abuse from recipients</li>
            <li>Fraudulent payment activity</li>
            <li>Any conduct we deem harmful to other users or third parties</li>
          </ul>
          <p className="mt-2 text-slate-400">No refunds will be issued for terminations due to policy violations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">6. Payment Terms</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Payments are processed securely through Stripe</li>
            <li>Prices are displayed in USD and charged at the time of purchase</li>
            <li>All sales are final once email generation has begun</li>
            <li>Refunds may be issued at our discretion for technical failures on our part</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">7. Intellectual Property</h2>
          <p>
            You retain all rights to your uploaded contact data and templates. The generated email content is yours
            to use as you see fit. SpookyEmail and its branding are trademarks of SRO Software Limited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">8. Limitation of Liability</h2>
          <p>
            SpookyEmail is provided "as is" without warranties of any kind. We are not liable for any damages
            arising from your use of the Service, including but not limited to: email deliverability issues,
            content accuracy, or consequences of emails sent using generated content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless SRO Software Limited from any claims, damages, or expenses
            arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Ireland. Any disputes shall be resolved in the courts of Ireland.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">11. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance
            of the new Terms. Material changes will be notified via email or prominent notice on the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">12. Contact</h2>
          <p>
            For questions about these Terms:<br />
            Email: <a href="mailto:legal@spookyemail.com" className="text-orange-400 hover:text-orange-300">legal@spookyemail.com</a><br />
            Address: SRO Software Limited, Warrenstown House, Warrenstown, Dunboyne, Co. Meath, Ireland
          </p>
        </section>
      </div>
    </div>
  );
};

// --- SECURITY PAGE ---
export const SecurityPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-900/30">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Security & Data Protection</h1>
        <p className="text-slate-400">How we keep your data safe</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 md:p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Encryption
          </h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong className="text-slate-300">In Transit:</strong> All data is encrypted using TLS 1.3 with 256-bit encryption</li>
            <li><strong className="text-slate-300">At Rest:</strong> Database encrypted using AES-256 encryption</li>
            <li><strong className="text-slate-300">API Communications:</strong> All API calls use HTTPS with certificate pinning</li>
            <li><strong className="text-slate-300">Payment Data:</strong> Handled exclusively by Stripe (PCI-DSS Level 1 certified)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Access Control
          </h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Minimal access principle - only essential personnel can access production systems</li>
            <li>All administrative access requires multi-factor authentication</li>
            <li>API keys and secrets stored in encrypted environment variables</li>
            <li>Regular access audits and key rotation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <Server className="h-5 w-5 text-orange-500" />
            Infrastructure
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-200 mb-2">Frontend Hosting</h4>
              <p className="text-slate-400 text-xs">GitHub Pages with Cloudflare CDN</p>
              <ul className="text-xs text-slate-500 mt-2 space-y-1">
                <li>• Global edge distribution</li>
                <li>• DDoS protection</li>
                <li>• Automatic SSL certificates</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-200 mb-2">Backend Processing</h4>
              <p className="text-slate-400 text-xs">Cloudflare Workers</p>
              <ul className="text-xs text-slate-500 mt-2 space-y-1">
                <li>• Serverless edge computing</li>
                <li>• Automatic scaling</li>
                <li>• ISO 27001 certified</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-200 mb-2">Database</h4>
              <p className="text-slate-400 text-xs">Neon Serverless Postgres</p>
              <ul className="text-xs text-slate-500 mt-2 space-y-1">
                <li>• SOC 2 Type II certified</li>
                <li>• Automatic backups</li>
                <li>• Encryption at rest</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-200 mb-2">Payments</h4>
              <p className="text-slate-400 text-xs">Stripe</p>
              <ul className="text-xs text-slate-500 mt-2 space-y-1">
                <li>• PCI-DSS Level 1</li>
                <li>• No card data touches our servers</li>
                <li>• 3D Secure supported</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Data Storage & Retention</h2>
          <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4">
            <p className="text-green-300 font-medium mb-2">Free Tier: Zero Data Storage</p>
            <p className="text-green-300/70 text-xs">
              When using your own API key, all processing happens in your browser. Your contact data
              is sent directly to Google's API and never touches our servers.
            </p>
          </div>
          <div className="mt-4">
            <p className="text-slate-400 mb-2">For paid orders:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
              <li>Contact data: Deleted immediately after email delivery</li>
              <li>Generated emails: Deleted after delivery to your inbox</li>
              <li>Order metadata: Retained for 90 days for support</li>
              <li>Payment records: Retained as required by law</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Subprocessors</h2>
          <p className="text-slate-400 mb-3">We use the following third-party services to deliver our product:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Service</th>
                  <th className="text-left py-2 text-slate-300">Purpose</th>
                  <th className="text-left py-2 text-slate-300">Location</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Cloudflare</td>
                  <td className="py-2">CDN, Workers, Security</td>
                  <td className="py-2">Global (US-based)</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Neon</td>
                  <td className="py-2">Database</td>
                  <td className="py-2">AWS eu-west-1</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Stripe</td>
                  <td className="py-2">Payments</td>
                  <td className="py-2">US (EU data in EU)</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Google (Gemini)</td>
                  <td className="py-2">AI Generation</td>
                  <td className="py-2">US</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Postmark</td>
                  <td className="py-2">Email Delivery</td>
                  <td className="py-2">US</td>
                </tr>
                <tr>
                  <td className="py-2">PostHog</td>
                  <td className="py-2">Analytics</td>
                  <td className="py-2">EU</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Vulnerability Reporting</h2>
          <p className="text-slate-400">
            If you discover a security vulnerability, please report it responsibly to{' '}
            <a href="mailto:security@spookyemail.com" className="text-orange-400 hover:text-orange-300">
              security@spookyemail.com
            </a>
            . We appreciate your help in keeping SpookyEmail secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Questions?</h2>
          <p className="text-slate-400">
            For security-related inquiries, contact us at{' '}
            <a href="mailto:security@spookyemail.com" className="text-orange-400 hover:text-orange-300">
              security@spookyemail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
