import { Globe, FileText, AtSign, Wifi, User, IndianRupee } from 'lucide-react'

export const QR_TYPES = [
  {
    id: 'website',
    label: 'Website / Link',
    icon: Globe,
    backendType: 'LINK',
    linkKind: 'WEBSITE',
    example: 'https://example.com',
    fields: [{ name: 'url', label: 'Link', placeholder: 'https://example.com' }],
  },
  {
    id: 'form',
    label: 'Form Link',
    icon: FileText,
    backendType: 'LINK',
    linkKind: 'FORM',
    example: 'https://forms.gle/your-form',
    fields: [{ name: 'url', label: 'Form link', placeholder: 'https://forms.gle/your-form' }],
  },
  {
    id: 'social',
    label: 'Social / Account',
    icon: AtSign,
    backendType: 'LINK',
    linkKind: 'SOCIAL',
    example: 'https://instagram.com/yourhandle',
    fields: [{ name: 'url', label: 'Profile link', placeholder: 'https://instagram.com/yourhandle' }],
  },
  {
    id: 'wifi',
    label: 'WiFi Network',
    icon: Wifi,
    backendType: 'WIFI',
    example: 'HomeNetwork',
    fields: [
      { name: 'ssid', label: 'Network name (SSID)', placeholder: 'HomeNetwork' },
      { name: 'password', label: 'Password', placeholder: 'Leave blank if open network' },
      { name: 'security', label: 'Security', type: 'select', options: ['WPA', 'WEP', 'NOPASS'] },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Card',
    icon: User,
    backendType: 'CONTACT',
    example: 'Priya Sharma',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Priya Sharma' },
      { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
      { name: 'email', label: 'Email', placeholder: 'priya@example.com' },
      { name: 'organization', label: 'Organization (optional)', placeholder: '' },
    ],
  },
  {
    id: 'upi',
    label: 'UPI / Payment',
    icon: IndianRupee,
    backendType: 'UPI',
    example: 'name@okbank',
    fields: [
      { name: 'upi_id', label: 'UPI ID', placeholder: 'name@okbank' },
      { name: 'payee_name', label: 'Payee name', placeholder: 'Priya Sharma' },
      { name: 'amount', label: 'Amount (optional)', placeholder: '250' },
    ],
  },
]

export function qrTypeById(id) {
  return QR_TYPES.find((t) => t.id === id)
}

// For the decode direction: map the backend's classification back to a
// friendly label + icon.
export const DECODE_TYPE_META = {
  WEBSITE: { label: 'Website', icon: Globe },
  FORM: { label: 'Form', icon: FileText },
  SOCIAL: { label: 'Social / Account', icon: AtSign },
  WIFI: { label: 'WiFi Network', icon: Wifi },
  CONTACT: { label: 'Contact Card', icon: User },
  UPI: { label: 'UPI / Payment', icon: IndianRupee },
  TEXT: { label: 'Plain Text', icon: FileText },
}
