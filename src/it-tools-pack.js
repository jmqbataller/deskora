import { Network, Printer, Code2, KeyRound, QrCode, Binary, ListChecks, FileStack, Archive, Calculator } from 'lucide-react'

export const itToolsPack = [
  { id:'ip-range-planner', name:'IP Range Planner', desc:'Plan IPv4 ranges, gateways and reserved addresses for office networks.', category:'it', icon:Network, badge:'New' },
  { id:'dhcp-planner', name:'DHCP Scope Planner', desc:'Calculate DHCP pools, exclusions and suggested reservations.', category:'it', icon:Network, badge:'New' },
  { id:'network-command-builder', name:'Network Command Builder', desc:'Generate Windows network diagnostic commands for a target host.', category:'it', icon:Code2, badge:'New' },
  { id:'network-reset-builder', name:'Windows Network Reset BAT', desc:'Build a downloadable BAT script for DNS, DHCP and Winsock repair.', category:'it', icon:Code2, badge:'New' },
  { id:'printer-fix-builder', name:'Printer Spooler Fix BAT', desc:'Generate a Windows print spooler repair script for office printers.', category:'it', icon:Printer, badge:'New' },
  { id:'map-drive-builder', name:'Map Network Drive BAT', desc:'Generate a BAT command to map a shared folder to a drive letter.', category:'it', icon:Archive, badge:'New' },
  { id:'robocopy-builder', name:'Robocopy Command Builder', desc:'Create robust Windows copy and backup commands with common options.', category:'it', icon:FileStack, badge:'New' },
  { id:'rdp-builder', name:'Remote Desktop Command Builder', desc:'Generate mstsc commands and connection details for Windows RDP.', category:'it', icon:Network, badge:'New' },
  { id:'unc-path-builder', name:'UNC Path Builder', desc:'Build clean Windows network share paths such as \\server\\share.', category:'it', icon:Network, badge:'New' },
  { id:'port-reference', name:'Common Port Reference', desc:'Search common TCP/UDP ports used by web, mail, DNS, RDP, SMB and more.', category:'it', icon:ListChecks, badge:'New' },
  { id:'port-range-tool', name:'Port Range Calculator', desc:'Inspect and summarize a TCP/UDP port range.', category:'it', icon:Calculator, badge:'New' },
  { id:'ipv4-binary', name:'IPv4 Binary Converter', desc:'Convert IPv4 addresses between dotted decimal and binary notation.', category:'it', icon:Binary, badge:'New' },
  { id:'ip-conflict-helper', name:'IP Conflict Troubleshooter', desc:'Generate a practical checklist for duplicate-IP and DHCP conflicts.', category:'it', icon:ListChecks, badge:'New' },
  { id:'shared-folder-helper', name:'Shared Folder Troubleshooter', desc:'Walk through Windows LAN share, SMB, firewall and permission checks.', category:'it', icon:ListChecks, badge:'New' },
  { id:'pc-info-script', name:'PC Info Collection BAT', desc:'Generate a BAT script that saves useful Windows hardware/network info.', category:'it', icon:Code2, badge:'New' },
  { id:'wifi-qr-office', name:'Office Wi-Fi QR', desc:'Generate an office Wi-Fi QR code for staff or guest networks.', category:'it', icon:QrCode, badge:'New' },
  { id:'hostname-generator', name:'PC Hostname Generator', desc:'Generate consistent workstation names by site, department and sequence.', category:'it', icon:FileStack, badge:'New' },
  { id:'random-token', name:'IT Token Generator', desc:'Generate UUIDs, random hex tokens, PINs and temporary credentials.', category:'it', icon:KeyRound, badge:'New' },
]
