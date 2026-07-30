UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
 
UEOS 
ENTERPRISE  OPERATING  SYSTEM
  
Complete  Feature  &  Product  Requirements  Document 
 Document  Type
 Product  Requirements  Document  (PRD)  
Version
 2.0.0  —  Unified  Enterprise  OS  
Date
 May  2026  
Status
 Draft  —  Pending  Engineering  Review 
Platform
 React  +  Supabase   
Prepared  By
 Unai  Product  Team  
 
CONFIDENTIAL  —  FOR  INTERNAL  USE  ONLY
  
Unai  Member  |  May  2026Page  
1  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
1.  Executive  Summary  
From  HRMS  to  Autonomous  Enterprise  Operating  System UNAI  is  a  next-generation  AI-powered  Enterprise  Operating  System  (EOS)  that  consolidates  
every
 
business
 
function
 
—
 
HR,
 
CRM,
 
Finance,
 
Administration,
 
Task
 
Management,
 
Meeting
 
Intelligence,
 
and
 
Smart
 
Automation
 
—
 
into
 
a
 
single,
 
unified,
 
intelligent
 
workspace.
 
Built
 
on
 
React
 
and
 
Supabase,
 
UNAI
 
eliminates
 
the
 
software
 
fragmentation
 
that
 
cripples
 
modern
 
businesses.
  The  core  thesis  of  UNAI  is  simple  but  radical:   Old  software  forces  humans  to  manage  software.  UNAI  makes  the  software  manage  itself  —  so  humans  can  focus  on  decisions,  relationships,  and  growth. 
 
What  UEOS  Replaces  
Tool  Category Tools  Replaced UNAI  Module 
HRMS  Workday,  BambooHR,  Keka,  Darwinbox  
Advanced  HRMS  Module  
CRM  Salesforce,  HubSpot,  Zoho  CRM  Smart  CRM  Module  Finance  /  ERP  Tally,  QuickBooks,  Zoho  Books  Finance  &  ERP  Module  Task  Management  Asana,  ClickUp,  Trello,  Monday.com  
Smart  Task  &  Workflow  OS  
Communication  Slack,  Microsoft  Teams  Internal  Communication  Hub  Knowledge  Base  Notion,  Confluence,  Guru  Enterprise  Knowledge  Brain  Meeting  Tools  Otter.ai,  Fireflies,  Zoom  AI  Meeting  Intelligence  System  Analytics  Tableau,  Metabase,  Power  BI  Executive  Intelligence  Dashboard  Automation  Zapier,  Make,  n8n  Smart  Automation  Marketplace  
 
Core  Modules  at  a  Glance  
# Module  Name Core  Purpose 
01  AI  Command  Center  Natural  language  interface  for  all  company  data  and  operations  02  Smart  CRM  AI-powered  customer  relationships,  pipelines,  and  communication  03  Advanced  HRMS  Full  employee  lifecycle:  recruit  →  onboard  →  grow  →  exit  
Unai  Member  |  May  2026Page  
2  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
# Module  Name Core  Purpose 
04  Finance  &  ERP  Invoicing,  payroll,  budgeting,  compliance,  cash  flow  05  Smart  Task  &  Workflow  OS  AI-generated  tasks,  autonomous  workflows,  project  tracking  06  Meeting  Intelligence  Transcription,  action  extraction,  meeting  memory  07  Internal  Communication  Hub  Contextual  chat,  smart  notifications,  department  channels  08  Enterprise  Knowledge  Brain  SOPs,  policies,  semantic  search,  AI  Q&A  09  Smart  Automation  Marketplace  No-code  automation  builder  and  pre-built  automation  library  10  Executive  Intelligence  Dashboard  
Live  company  health,  predictive  insights,  AI  recommendations  
  
Unai  Member  |  May  2026Page  
3  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
2.  Comprehensive  Market  Analysis  
A  deep  study  of  what  exists,  where  it  fails,  and  the  gap  UNAI  fills. 
2.1  CRM  Platforms  
Salesforce  
Category Detail 
Strengths  Deepest  enterprise  customisation,  powerful  automation  engine,  3,000+  integrations,  strong  analytics  with  Tableau  CRM  Weaknesses  Average  implementation  takes  6–12  months,  requires  certified  consultants,  UI  is  dense  and  overwhelming,  costs  $150–$300/user/month  Core  Gap  Not  employee-centric,  zero  HR  integration,  terrible  UX  for  SMBs,  poor  mobile  experience,  no  meeting  intelligence  
What  UNAI  Does  Better  
Zero  implementation  time,  AI-native  from  day  one,  CRM  +  HR  +  Finance  unified,  10x  cheaper  at  scale  
 
HubSpot  
Category Detail 
Strengths  Beautiful  UX,  excellent  marketing  +  CRM  integration,  free  tier  for  small  teams,  easy  to  adopt  Weaknesses  Automation  gets  expensive  fast  ($800–$3,200/month  for  Pro+),  limited  deep  operational  workflows,  reporting  is  shallow  Core  Gap  Purely  sales  and  marketing  focused,  no  HR  or  finance,  no  meeting  intelligence,  no  internal  knowledge  base  
What  UNAI  Does  Better  
Complete  operational  OS  not  just  sales  CRM,  AI  copilot  for  every  module,  unified  employee  +  customer  intelligence  
 
Zoho  One  
Category Detail 
Strengths  40+  apps  in  one  subscription,  affordable  ($37/user/month),  good  SME  adoption  in  India  Weaknesses  Extremely  fragmented  UX  across  apps,  switching  between  Zoho  CRM,  Zoho  People,  Zoho  Books  feels  like  different  products,  weak  AI  Core  Gap  No  unified  intelligence  layer,  apps  don't  share  context,  AI  is  bolt-on  not  native,  poor  predictive  capabilities  
Unai  Member  |  May  2026Page  
4  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Category Detail 
What  UNAI  Does  Better  
Truly  unified  context  graph,  one  AI  that  understands  all  modules  simultaneously,  predictive  operations  
 
2.2  HRMS  Platforms  
Workday  
Category Detail 
Strengths  Enterprise-grade  HR  architecture,  strong  workforce  analytics,  global  payroll,  compliance-heavy  Weaknesses  18–24  month  implementation,  $400–$600/user/year,  requires  dedicated  admin  team,  UI  from  2010  Core  Gap  No  CRM  integration,  no  meeting  intelligence,  no  task  management,  pure  HR  silo  
What  UNAI  Does  Better  
HR  as  part  of  full  operational  OS,  AI  attrition/burnout  prediction,  real-time  intelligence  not  quarterly  reports  
 
Keka  HR  (India)  
Category Detail 
Strengths  Good  Indian  payroll  compliance,  attendance  workflows,  decent  UX,  affordable  Weaknesses  Traditional  process  digitisation  only,  no  AI  layer,  no  CRM  or  Finance  integration,  no  automation  engine  Core  Gap  Digitises  paperwork  but  does  not  reduce  operational  thinking  load  
What  UNAI  Does  Better  
AI-native  HR  with  predictive  intelligence,  autonomous  workflows,  unified  with  CRM  and  Finance  
 
2.3  Office  Productivity  &  Collaboration  Tools  
Notion  
Category Detail 
Strengths  Flexible,  beautiful,  great  for  documentation  and  knowledge  management  Weaknesses  Users  become  system  managers  —  constant  manual  organisation,  no  operational  intelligence,  no  HR/Finance  Core  Gap  Knowledge  lives  in  Notion  but  operations  happen  everywhere  else  —  no  bridge  between  them  
Unai  Member  |  May  2026Page  
5  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Category Detail 
What  UNAI  Does  Better  
Knowledge  Brain  that  auto-generates  SOPs  from  meeting  notes,  auto-tags  content,  and  answers  questions  via  AI  
 
ClickUp  
Category Detail 
Strengths  Tasks  +  docs  +  goals  +  whiteboards  in  one  place,  highly  customisable  Weaknesses  Overwhelming  configuration  burden,  steep  learning  curve,  no  HR/CRM/Finance,  weak  AI  Core  Gap  Productivity  overload  —  too  many  options,  not  enough  intelligence  
What  UNAI  Does  Better  
AI  creates  tasks  automatically  from  meetings/emails,  workflows  run  autonomously,  zero  configuration  needed  
 
Slack  +  Microsoft  Teams  
Category Detail 
Strengths  Fast  communication,  integrations,  familiar  interface  Weaknesses  Information  chaos  at  scale,  no  contextual  intelligence,  messages  buried,  no  action  tracking  Core  Gap  Communication  is  not  execution  —  important  action  items  get  lost  in  message  noise  
What  UNAI  Does  Better  
AI  extracts  action  items  from  chat,  auto-creates  tasks,  summarises  channel  activity,  contextual  smart  notifications  
 
2.4  The  Market  Gap  UNAI  Fills  
India  has  no  AI-native,  unified  enterprise  operating  system  that  combines  CRM  +  HRMS  +  Finance  +  Automation  +  Intelligence  into  one  affordable  platform.  UNAI  is  that  platform. 
 Capability Salesforce 
Workday Zoho Notion  +  Slack 
UNAI 
Unified  CRM  +  HR  +  Finance  No  No  Fragmented  
No  Yes  —  Native  AI  Copilot  (all  modules)  Partial  No  Limited  No  Yes  —  Full  Meeting  Intelligence  No  No  No  No  Yes  Autonomous  Workflows  Partial  No  Limited  No  Yes  
Unai  Member  |  May  2026Page  
6  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Capability Salesforce 
Workday Zoho Notion  +  Slack 
UNAI 
Predictive  Attrition/Sales  Partial  Limited  No  No  Yes  Knowledge  Graph  No  No  No  Manual  Yes  —  Auto  India  Payroll  Compliance  No  Partial  Yes  No  Yes  Affordable  for  SMBs  No  No  Yes  Yes  Yes  Zero  Implementation  Time  No  No  No  Yes  Yes  
  
Unai  Member  |  May  2026Page  
7  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
3.  Product  Architecture  
3.1  Philosophy  UNAI  is  built  on  three  architectural  principles:  •  Event-Driven  Intelligence  —  every  user  action  emits  a  system  event  that  AI  agents  can  
react
 
to
 
in
 
real
 
time
 •  Contextual  Memory  —  all  modules  share  a  unified  data  graph  so  every  AI  response  has  
full
 
company
 
context
 •  Progressive  Automation  —  the  system  learns  workflows  over  time  and  progressively  
automates
 
repetitive
 
decisions
  
3.2  Technology  Stack  
Layer Technology Purpose 
Frontend  React  18  +  Next.js  14  +  Tailwind  CSS  Web  application  and  admin  dashboards  Mobile  React  Native  +  Expo  iOS  and  Android  employee  apps  Backend  API  Supabase  Edge  Functions  +  Node.js  NestJS  
REST  and  GraphQL  API  layer  
Database  Supabase  PostgreSQL  +  Row  Level  Security  
Multi-tenant  relational  data  store  
AI  Layer  Python  FastAPI  microservices  +  LangGraph  
AI  agents,  orchestration,  inference  
Vector  Search  pgvector  +  OpenAI  Embeddings  Semantic  search  and  knowledge  retrieval  Realtime  Supabase  Realtime  Channels  Live  updates  across  all  connected  clients  File  Storage  Supabase  Storage  +  CDN  Documents,  media,  payslips  Document  AI  Tesseract  OCR  +  Vision  Models  +  GPT-4V  
Document  verification  engine  
Meeting  AI  Whisper  STT  +  LLM  Summarisation  Transcription  and  action  extraction  Queue  System  Redis  +  BullMQ  Async  job  processing  Workflow  Engine  Temporal  /  n8n  (self-hosted)  Long-running  workflow  orchestration  Analytics  Apache  Superset  /  Metabase  (embedded)  
Dashboards  and  BI  reports  
Notifications  Firebase  FCM  +  SendGrid  +  Twilio  +  WhatsApp  
Multi-channel  notification  delivery  
Unai  Member  |  May  2026Page  
8  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Layer Technology Purpose 
Search  Typesense  (self-hosted)  Fast  full-text  search  across  all  modules  Deployment  Docker  +  Kubernetes  on  AWS  /  GCP  Container  orchestration  and  scaling  CI/CD  GitHub  Actions  +  Vercel  Automated  testing  and  deployment  
 
3.3  Event  System  Architecture  Every  action  in  UNAI  emits  a  structured  event.  AI  agents  subscribe  to  these  events  and  react  
autonomously.
  Event  Name Triggered  When AI  Agent  Reaction 
employee.created  HR  Officer  creates  new  employee  profile  
Auto-creates  onboarding  task  chain,  sends  welcome  email,  sets  payroll  profile  leave.applied  Employee  submits  leave  request  Checks  team  coverage,  flags  conflicts,  routes  to  correct  approver  meeting.ended  Meeting  recording  uploaded  Transcribes  audio,  extracts  action  items,  creates  tasks,  sends  summary  invoice.paid  Client  invoice  marked  paid  Updates  cash  flow  forecast,  triggers  revenue  recognition,  notifies  CFO  lead.viewed  CRM  lead  opens  proposal  email  Notifies  sales  rep,  suggests  follow-up  timing,  updates  lead  score  expense.submitted  Employee  submits  expense  claim  Checks  policy  compliance,  flags  anomalies,  routes  to  manager  document.uploaded  Document  added  to  system  Triggers  AI  OCR  verification,  duplicate  check,  compliance  tagging  employee.inactive  No  logins  detected  for  3+  days  Alerts  HR  Manager,  cross-references  leave  records,  flags  for  follow-up  payroll.processed  Monthly  payroll  run  completed  Generates  payslips,  sends  email  notifications,  updates  finance  dashboard  task.overdue  Task  past  due  date  with  no  update  Notifies  assignee,  escalates  to  manager,  updates  project  health  score  
Unai  Member  |  May  2026Page  
9  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
  
Unai  Member  |  May  2026Page  
10  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
4.  Module  Specifications  
This  section  contains  complete  functional  requirements  for  all  10  UNAI  modules.  Each  module  
is
 
designed
 
as
 
an
 
independent
 
but
 
deeply
 
interconnected
 
unit
 
of
 
the
 
unified
 
operating
 
system.
  
01 
AI  Command  Center The  brain  of  UNAI  —  natural  language  interface  for  all  operations 
 The  AI  Command  Center  is  the  central  intelligence  layer  of  UNAI.  It  is  the  first  screen  every  user  
sees
 
and
 
the
 
feature
 
that
 
distinguishes
 
UNAI
 
from
 
every
 
other
 
enterprise
 
platform.
 
Every
 
module's
 
data
 
flows
 
into
 
the
 
Command
 
Center,
 
enabling
 
AI
 
to
 
answer
 
any
 
question,
 
perform
 
any
 
action,
 
and
 
predict
 
any
 
outcome
 
across
 
the
 
entire
 
company.
  
4.1.1  Natural  Language  Query  Interface  •  Universal  search  bar  accessible  from  any  screen  via  keyboard  shortcut  (Cmd/Ctrl  +  K)  •  Ask  questions  in  plain  English:  'Who  has  the  most  pending  leave  this  month?'  or  'Show  
revenue
 
trend
 
for
 
Q2'
 •  AI  understands  company-specific  terminology  —  department  names,  employee  names,  
project
 
codes
 •  Results  rendered  as  tables,  charts,  cards,  or  summaries  depending  on  the  query  type  •  Full  conversation  history  —  follow-up  questions  maintain  context  •  Multi-language  input  support  (English  primary,  regional  language  expansion  roadmap)   
4.1.2  AI  Operational  Copilot  •  Proactive  suggestions  on  the  home  dashboard  —  'You  have  7  pending  approvals.  
Approve
 
all
 
routine
 
ones?'
 •  AI  drafts  emails,  reports,  announcements,  and  documents  on  request  •  One-click  execution  of  complex  multi-step  operations  via  plain  language  commands  •  'Explain  this  chart'  —  AI  provides  narrative  analysis  of  any  dashboard  widget  •  AI  weekly  digest  —  automated  summary  of  company  health  delivered  every  Monday  
morning
  
4.1.3  Predictive  Intelligence  Alerts  
Alert  Type Trigger  Condition Action  Suggested 
Attrition  Risk  Employee  burnout  signals  detected  (low  activity,  sentiment  drop,  leave  spikes)  
Schedule  1-on-1  with  HR  Manager  Sales  Opportunity  Lead  engagement  score  spikes  —  proposal  opened  3+  times  
Reach  out  within  24  hours  
Unai  Member  |  May  2026Page  
11  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Alert  Type Trigger  Condition Action  Suggested 
Cash  Flow  Warning  Projected  outflows  exceed  inflows  in  next  30  days  
Delay  non-critical  vendor  payments  Compliance  Deadline  PF/ESI/TDS  due  date  within  7  days  Initiate  payroll  compliance  run  Headcount  Gap  Project  demand  exceeds  available  team  capacity  in  2  weeks  
Post  job  requisition  or  reassign  
Anomaly  Detection  Expense  submission  pattern  deviates  from  employee  baseline  by  3x  
Flag  for  CFO  review  
 
4.1.4  AI-Generated  Reports  •  One-sentence  report  generation:  'Generate  monthly  HR  report  for  April'  creates  a  full  
formatted
 
document
 •  AI  narrative  summaries  accompany  every  data  export  ('Revenue  grew  12%  driven  by  3  
new
 
enterprise
 
accounts')
 •  Auto-scheduled  reports  —  configure  weekly/monthly  reports  to  generate  and  email  
automatically
 •  Board-ready  presentations  generated  from  live  data  on  demand   
4.1.5  AI  Memory  &  Context  Graph  •  Every  employee,  customer,  project,  task,  invoice,  and  meeting  linked  in  a  unified  
knowledge
 
graph
 •  Ask  cross-module  questions:  'Show  all  deals,  tasks,  and  invoices  related  to  Acme  Corp  
this
 
quarter'
 •  Temporal  memory:  'What  did  the  finance  team  decide  last  Friday?'  returns  accurate  
context
 
from
 
meeting
 
notes
 •  Entity  recognition  —  UNAI  understands  'the  Chennai  team',  'Q3  targets',  'the  Sharma  
account'
 
without
 
disambiguation
  
02 
Smart  CRM  Module AI-powered  customer  intelligence,  pipelines  &  communication 
 The  UNAI  CRM  is  not  a  traditional  contact  database.  It  is  a  customer  intelligence  engine  that  
tracks
 
every
 
interaction,
 
predicts
 
deal
 
outcomes,
 
and
 
automates
 
follow-up
 
—
 
connecting
 
customer
 
activity
 
directly
 
to
 
the
 
HR
 
and
 
Finance
 
modules
 
for
 
a
 
complete
 
business
 
picture.
  
4.2.1  Contact  &  Lead  Management  •  Unified  contact  database:  leads,  prospects,  clients,  and  vendors  in  one  view  •  AI-powered  lead  scoring  (0–100)  based  on  engagement,  company  fit,  deal  size,  and  
behaviour
 
patterns
 
Unai  Member  |  May  2026Page  
12  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Auto-enrichment  from  email  signatures,  LinkedIn  profiles,  and  company  websites  •  Lead  source  tracking:  website,  referral,  social,  cold  outreach,  events  •  Duplicate  detection  and  merge  suggestions  powered  by  fuzzy  matching  •  Custom  fields  per  contact  category  with  configurable  data  types   
4.2.2  Deal  Pipeline  Management  •  Visual  Kanban  pipeline  with  drag-and-drop  deal  stages  •  Custom  pipeline  stages  per  product  line  or  business  unit  •  AI  stage  recommendations:  'Move  this  deal  to  Proposal  —  engagement  signals  match  
87%
 
of
 
won
 
deals
 
at
 
this
 
stage'
 •  Deal  rot  detection:  flags  deals  with  no  activity  for  configurable  time  periods  •  Weighted  pipeline  value  calculation  with  win  probability  per  stage  •  Multi-pipeline  support  for  different  product  lines  or  geographies   
4.2.3  Communication  Intelligence  •  Email  integration  —  track  opens,  clicks,  and  replies  automatically  •  AI  email  drafting  —  'Write  a  follow-up  to  Acme  Corp's  CFO  about  the  proposal  from  last  
week'
 •  WhatsApp  Business  integration  for  direct  client  messaging  inside  UNAI  •  Call  logging  with  optional  AI  transcription  and  sentiment  analysis  •  Sentiment  tracking  across  all  communications  —  relationship  health  score  per  account  •  Auto  follow-up  reminders:  'You  haven't  contacted  Reliance  Industries  in  14  days  —  they  
typically
 
close
 
in
 
this
 
window'
  
4.2.4  Unified  Customer  Timeline  Every  customer  account  displays  a  single  chronological  timeline  containing:  •  All  calls,  emails,  WhatsApp  messages,  and  meetings  •  All  proposals,  quotes,  and  contracts  sent  •  All  invoices  raised  and  payment  status  •  All  support  tickets  and  resolution  history  •  All  tasks  assigned  internally  related  to  this  account  •  All  documents  shared  or  received   
4.2.5  Sales  Intelligence  &  Forecasting  •  AI  revenue  forecasting:  monthly,  quarterly,  and  annual  projections  with  confidence  
intervals
 •  Win/loss  analysis:  AI  identifies  common  patterns  in  closed-won  vs  closed-lost  deals  •  Territory  and  rep  performance  analytics  with  leaderboards  •  Conversion  funnel  analysis  from  lead  to  cash  with  stage-by-stage  drop-off  rates  •  Deal  velocity  tracking:  average  days  per  stage  and  time  to  close  by  deal  size  
Unai  Member  |  May  2026Page  
13  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
 
4.2.6  Quotation  &  Proposal  Engine  •  Create  professional  quotations  and  proposals  directly  inside  UNAI  •  Product/service  catalogue  with  configurable  pricing,  discounts,  and  tax  rules  •  AI  proposal  writer  —  generate  first  draft  from  deal  notes  and  client  profile  •  E-signature  integration  for  digital  contract  execution  •  Proposal  viewed  notification:  'Acme  Corp  opened  your  proposal  3  times  in  the  last  hour'  •  One-click  conversion:  quote  to  invoice  to  payment  tracking   
4.2.7  Customer  Support  &  Ticket  Management  •  Omni-channel  ticket  inbox:  email,  WhatsApp,  web  form  •  AI  ticket  categorisation  and  priority  assignment  •  SLA  tracking  with  escalation  rules  •  Resolution  templates  with  AI-suggested  responses  •  Customer  satisfaction  score  (CSAT)  collection  post-resolution   
03 
Advanced  HRMS  Module Full  employee  lifecycle  —  recruit,  onboard,  grow,  retain,  exit 
 Building  on  the  existing  HR  Docs  foundation  (v1.0),  the  UNAI  HRMS  expands  into  a  full-lifecycle  
employee
 
intelligence
 
platform.
 
All
 
existing
 
features
 
(payroll,
 
attendance,
 
leave,
 
onboarding,
 
document
 
verification)
 
are
 
retained
 
and
 
upgraded
 
with
 
AI
 
capabilities.
  
4.3.1  Recruitment  Intelligence  •  Job  requisition  workflow:  department  head  requests  hire,  HR  approves,  job  published  
automatically
 •  Multi-channel  job  posting:  LinkedIn,  Naukri,  Indeed,  company  careers  page  —  from  one  
UNAI
 
interface
 •  AI  resume  parser:  extracts  skills,  experience,  education,  and  scores  candidate-job  fit  
(0–100%)
 •  Automated  candidate  screening  questionnaire  with  AI  scoring  •  Interview  scheduling  with  calendar  integration  and  auto-reminders  •  AI  interview  analysis:  structured  scorecards,  competency  mapping,  comparison  across  
candidates
 •  Offer  letter  generation  with  configurable  templates  and  e-signature  •  End-to-end  candidate  pipeline:  Applied  →  Screened  →  Interview  →  Offer  →  Joined   
4.3.2  AI-Powered  Document  Verification  (Enhanced  from  v1.0)  Retaining  all  v1.0  verification  capabilities  and  expanding:  
Unai  Member  |  May  2026Page  
14  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Additional  document  types:  ITR,  Form  16,  Bank  Statements,  EPFO  UAN  cards,  
Professional
 
certificates
 •  Liveness  check  for  Aadhaar  face  match  (future:  face  recognition  API)  •  Document  classification:  AI  automatically  identifies  document  type  without  manual  
selection
 •  Batch  verification:  process  all  documents  for  a  new  hire  simultaneously  •  Verification  audit  trail:  complete  history  of  AI  decisions  and  HR  overrides   
4.3.3  Employee  Lifecycle  Management  
Stage Features 
Pre-Joining  Digital  offer  acceptance,  pre-onboarding  portal,  document  collection  before  day  1  Day  1  Onboarding  Automatic  account  creation,  asset  assignment  checklist,  IT  setup  tasks,  buddy  assignment  Probation  Goal  setting,  30/60/90  day  check-ins,  automatic  probation  confirmation  workflow  Active  Employment  Performance  cycles,  skill  development,  internal  mobility,  transfer,  promotion  Exit  Management  Resignation  acceptance,  notice  period  tracking,  handover  checklist,  FnF  settlement,  rehire  eligibility   
4.3.4  Smart  Attendance  &  Time  Tracking  •  Web  and  mobile  clock-in  /  clock-out  with  GPS  geofencing  •  Face  recognition  attendance  (optional  module,  configurable  per  company)  •  Shift  management:  fixed  shifts,  rotational  shifts,  flexible  hours  —  all  configurable  •  Overtime  calculation:  automatic  based  on  shift  configuration  and  Indian  labour  law  rules  •  AI  anomaly  detection:  'Ravi  logged  14  hours  today  —  unusual  compared  to  his  baseline  
of
 
8.5
 
hours'
 •  Regularisation  workflow:  employee  requests  attendance  correction,  manager  approves  •  Integration  with  physical  biometric  devices  via  API  (Phase  2)   
4.3.5  Enhanced  Leave  Management  •  20+  configurable  leave  types  including:  Annual,  Sick,  Casual,  Maternity,  Paternity,  
Bereavement,
 
Compensatory
 
Off,
 
Loss
 
of
 
Pay
 •  Accrual  engine:  pro-rated  leave  credit  based  on  joining  date,  configurable  accrual  
frequency
 •  Holiday  calendar:  company-level  and  state-level  public  holidays,  auto-applied  by  
employee
 
location
 •  Multi-level  approval  chains:  configurable  per  leave  type  and  department  •  Team  leave  coverage  check:  system  flags  if  too  many  team  members  are  on  leave  
simultaneously
 
Unai  Member  |  May  2026Page  
15  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Leave  encashment:  configurable  rules  for  year-end  leave  payout   
4.3.6  Payroll  Engine  (Enhanced)  •  Configurable  salary  structure:  Basic,  HRA,  DA,  Special  Allowance,  LTA,  Medical,  Bonus,  
Incentives
 •  Statutory  compliance:  PF,  ESI,  PT  (state-wise),  TDS  with  Form  16  generation  •  Variable  pay  processing:  performance-linked  bonuses,  commissions,  incentives  •  Salary  revision  workflows:  appraisal  cycle  triggered  increments  with  approval  chain  •  Payslip  generation:  branded  PDF  payslips  with  YTD  summary  •  Bulk  payroll  processing  with  exception  reporting:  'These  3  employees  have  salary  inputs  
missing'
 •  Bank  file  generation:  NEFT/RTGS  file  formats  for  direct  bank  uploads  •  Full  PF  ECR  report,  ESI  challan,  PT  returns  for  each  state   
4.3.7  Employee  Intelligence  &  Wellbeing  •  Burnout  prediction:  AI  analyses  attendance  patterns,  message  frequency,  daily  report  
sentiment,
 
leave
 
usage
 •  Attrition  prediction:  60-day  early  warning  for  flight  risk  employees  with  suggested  
retention
 
actions
 •  Productivity  analytics:  output  vs  hours  worked  trends  over  time  •  Skill  gap  analysis:  current  skills  vs  role  requirements  with  learning  recommendations  •  Engagement  score:  AI-computed  monthly  engagement  health  per  department  •  Anonymous  pulse  surveys  with  AI  trend  analysis  across  responses   
4.3.8  Performance  Management  •  OKR-based  goal  setting:  company  →  department  →  individual  cascade  •  Continuous  check-in  system:  weekly  progress  updates  on  goals  •  360-degree  feedback:  peers,  managers,  and  self-assessment  •  Performance  rating  engine:  configurable  rating  scales  (3/5/10  point)  with  normalisation  •  AI  performance  narrative:  'Based  on  Priya's  goal  progress  and  peer  feedback,  here  is  a  
draft
 
review
 
summary'
 •  Career  growth  paths:  configurable  promotion  tracks  with  competency  milestones  •  Internal  job  posting:  employees  can  apply  for  open  roles  inside  the  company   
04 
Finance  &  ERP  Module Smart  accounting,  budgeting,  procurement  &  cash  flow  intelligence 
 The  UNAI  Finance  module  connects  seamlessly  with  HR  (payroll)  and  CRM  (invoicing)  to  give  
finance
 
teams
 
and
 
leadership
 
a
 
live,
 
AI-augmented
 
view
 
of
 
company
 
finances
 
—
 
without
 
switching
 
between
 
Tally,
 
Excel,
 
and
 
a
 
payroll
 
system.
 
Unai  Member  |  May  2026Page  
16  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
 
4.4.1  Accounting  &  Bookkeeping  •  Chart  of  accounts:  fully  configurable  for  Indian  accounting  standards  (Schedule  III,  Ind  
AS)
 •  Journal  entries,  credit/debit  notes,  bank  reconciliation  •  AI  invoice  categorisation:  automatically  maps  vendor  invoices  to  correct  expense  heads  •  GST  compliance:  GSTR-1,  GSTR-3B,  GSTR-2A  reconciliation,  HSN/SAC  code  
management
 •  TDS  management:  deduction,  challan  payment,  Form  26Q  filing  •  Multi-currency  support  with  real-time  exchange  rates   
4.4.2  Invoicing  &  Revenue  Management  •  Professional  invoice  creation  with  company  branding,  terms,  and  payment  links  •  Automatic  invoice  generation  from  approved  CRM  quotations  •  Payment  tracking:  partial  payments,  advance  tracking,  write-offs  •  AI  dunning:  automatic  payment  reminders  at  7,  14,  30  days  overdue  with  escalating  tone  •  Recurring  invoice  automation  for  subscription-based  clients  •  Revenue  recognition  rules:  project-based,  milestone-based,  or  time-based   
4.4.3  Expense  Management  •  Employee  expense  submission  via  mobile:  photo  of  receipt,  auto-OCR  extracts  amount  
and
 
merchant
 •  Policy  engine:  configurable  limits  per  expense  category  and  grade  level  •  Approval  workflow:  manager  approval,  then  finance  approval  for  high-value  claims  •  AI  anomaly  detection:  duplicate  claims,  out-of-policy  amounts,  unusual  merchant  
categories
 •  Reimbursement  processing  integrated  with  payroll  cycle  •  Travel  booking  integration  (future):  direct  flight  and  hotel  booking  with  policy  guard  rails   
4.4.4  Budget  &  Cash  Flow  Intelligence  •  Annual  budget  creation:  top-down  (CFO  sets  company  budget,  allocates  to  departments)  
or
 
bottom-up
 
(departments
 
propose,
 
CFO
 
consolidates)
 •  Real-time  budget  vs  actuals  tracking  with  variance  analysis  •  Cash  flow  forecasting:  AI  projects  weekly  cash  position  based  on  receivables,  payables,  
and
 
payroll
 •  'What-if'  scenario  modelling:  'If  we  hire  5  engineers  next  month,  what  is  our  runway?'  •  Burn  rate  tracking  for  funded  startups   
4.4.5  Procurement  &  Vendor  Management  
Unai  Member  |  May  2026Page  
17  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Vendor  master:  complete  vendor  profiles  with  GST,  PAN,  bank  details,  compliance  
certificates
 •  Purchase  requisition  →  PO  approval  →  Goods  receipt  →  Invoice  matching  workflow  •  3-way  match:  PO,  GRN,  and  vendor  invoice  reconciliation  before  payment  •  Vendor  performance  scoring:  delivery  reliability,  quality  rating,  payment  terms  adherence  •  Contract  management:  vendor  agreements  with  renewal  alerts   
4.4.6  Financial  Reporting  •  P&L  statement,  balance  sheet,  cash  flow  statement  (auto-generated  from  transactions)  •  Department-wise  cost  centre  reports  •  Board  pack  generation:  one-click  monthly  financial  summary  in  presentation  format  •  Investor-ready  MIS  reports  with  AI  narrative  •  Audit  trail:  every  financial  transaction  has  complete  edit  history  and  approver  chain   
05 
Smart  Task  &  Workflow  OS AI  task  creation,  project  tracking  &  autonomous  workflow  engine 
 The  UNAI  Task  OS  replaces  Asana,  ClickUp,  Trello,  and  Monday.com.  The  fundamental  
difference:
 
instead
 
of
 
humans
 
creating
 
and
 
managing
 
tasks,
 
UNAI's
 
AI
 
generates,
 
assigns,
 
and
 
resolves
 
tasks
 
automatically
 
based
 
on
 
events
 
across
 
every
 
other
 
module.
  
4.5.1  AI  Task  Generation  •  Meeting-to-task:  after  every  meeting,  AI  extracts  action  items  and  creates  assigned  tasks  
automatically
 •  Email-to-task:  AI  monitors  email  threads  and  creates  tasks  from  commitments  and  
follow-ups
 •  Chat-to-task:  '@task'  mention  in  Internal  Hub  creates  a  tracked  task  instantly  •  Voice  note  to  task:  record  a  voice  memo,  AI  transcribes  and  creates  structured  tasks  •  Document-to-task:  upload  a  contract  —  AI  creates  tasks  for  each  obligation  and  deadline   
4.5.2  Project  Management  •  Hierarchical  project  structure:  Workspace  →  Project  →  Epic  →  Task  →  Sub-task  •  Multiple  views:  Kanban  board,  List  view,  Timeline  (Gantt),  Calendar  view,  and  Table  view  •  Dependencies:  Task  B  cannot  start  until  Task  A  is  complete  —  with  cascade  delay  alerts  •  Milestones  with  automatic  status  reporting  to  project  stakeholders  •  Project  health  score:  AI  computes  Red/Amber/Green  status  based  on  task  completion,  
timeline,
 
and
 
team
 
velocity
 •  Resource  allocation  view:  see  which  team  members  are  over/under-allocated  across  all  
projects
  
Unai  Member  |  May  2026Page  
18  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
4.5.3  Autonomous  Workflow  Engine  Pre-built  autonomous  workflows  (no  configuration  needed):  
Workflow  Name Trigger Automated  Steps 
Employee  Onboarding  New  employee  profile  created  
Create  email  account  →  Assign  laptop  request  task  →  Schedule  orientation  →  Send  welcome  kit  →  Create  payroll  record  →  Add  to  team  channels  →  Assign  buddy  Client  Onboarding  Deal  marked  Won  in  CRM  Create  project  →  Assign  account  manager  →  Send  welcome  email  →  Schedule  kickoff  meeting  →  Create  contract  task  →  Set  up  billing  Invoice  to  Cash  Invoice  sent  to  client  Track  opening  →  Send  reminder  at  day  7  →  Escalate  at  day  14  →  Flag  for  CFO  at  day  30  →  Initiate  legal  template  at  day  60  Employee  Exit  Resignation  submitted  Start  notice  period  timer  →  Create  handover  tasks  →  Revoke  system  access  on  last  day  →  Process  FnF  →  Update  headcount  →  Trigger  backfill  requisition  Leave  Approval  Chain  Leave  request  submitted  Check  balance  →  Check  team  coverage  →  Notify  approver  →  Auto-approve  routine  leaves  under  1  day  →  Escalate  if  no  response  in  24h  
Performance  Review  Cycle  
Review  cycle  date  reached  Notify  all  managers  →  Distribute  self-assessment  forms  →  Send  peer  feedback  requests  →  Compile  ratings  →  Generate  review  documents  →  Schedule  1-on-1s   
4.5.4  Custom  Workflow  Builder  •  Drag-and-drop  workflow  designer:  trigger  →  conditions  →  actions  •  20+  trigger  types:  form  submission,  date  reached,  field  change,  approval,  payment,  
status
 
change
 •  50+  action  types:  send  email,  create  task,  update  field,  notify  user,  generate  document,  
call
 
webhook
 •  Conditional  branching:  if  X  then  do  Y,  else  do  Z  •  Loop  controls:  wait  for  approval,  wait  for  date,  retry  logic  •  Workflow  analytics:  success  rate,  average  completion  time,  failure  points   
06 
Meeting  Intelligence  System Transcription,  action  extraction  &  institutional  meeting  memory 
 
Unai  Member  |  May  2026Page  
19  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
The  Meeting  Intelligence  System  transforms  every  meeting  from  a  forgettable  event  into  a  
searchable,
 
actionable,
 
institutional
 
memory.
 
This
 
module
 
is
 
one
 
of
 
UNAI's
 
most
 
significant
 
differentiators
 
against
 
all
 
existing
 
platforms.
  
4.6.1  Meeting  Recording  &  Transcription  •  Native  meeting  room  in  UNAI  (video  calls)  with  automatic  recording  •  Integration  with  Zoom,  Google  Meet,  and  Microsoft  Teams  —  bot  joins  and  records  •  AI  transcription  using  Whisper  STT  —  95%+  accuracy  for  English  and  Hindi  •  Speaker  identification  and  diarisation  —  'Raj  said…',  'The  CFO  mentioned…'  •  Real-time  live  transcription  during  meetings  for  accessibility  and  note-taking   
4.6.2  Post-Meeting  Intelligence  •  AI  meeting  summary  generated  within  60  seconds  of  meeting  end  •  Action  item  extraction  with  automatic  assignee  detection  from  conversation  context  •  Decision  log:  AI  identifies  and  lists  all  decisions  made  during  the  meeting  •  Discussion  sentiment:  was  the  meeting  collaborative,  contentious,  or  exploratory?  •  Meeting  analytics:  talk  time  distribution,  key  topics,  questions  asked   
4.6.3  Meeting  Memory  Search  •  Search  across  all  meeting  transcripts  using  natural  language  •  'What  did  we  decide  about  the  product  roadmap  in  February?'  returns  the  exact  segment  •  Person-specific  search:  'Find  all  meetings  where  the  CTO  discussed  infrastructure  costs'  •  Topic  clustering:  UNAI  groups  meetings  by  topic  and  shows  how  discussions  evolved  
over
 
time
 •  Auto-links  meeting  decisions  to  related  tasks,  projects,  and  client  accounts   
4.6.4  Meeting  Lifecycle  Management  •  Meeting  scheduling  inside  UNAI  with  calendar  sync  (Google  Calendar,  Outlook)  •  Agenda  builder  with  AI  suggestions  based  on  open  action  items  and  pending  decisions  •  Pre-meeting  brief:  AI  summarises  relevant  context  —  'Last  3  meetings  with  this  client  
covered
 
pricing,
 
delivery
 
timeline,
 
and
 
support
 
SLA'
 •  Post-meeting  follow-up  automation:  email  summary  sent  to  all  attendees  within  10  
minutes
 •  Meeting  effectiveness  score:  ratio  of  action  items  completed  from  previous  meeting   
07 
Internal  Communication  Hub Contextual  team  chat,  smart  notifications  &  AI-powered  information  flow 
 
Unai  Member  |  May  2026Page  
20  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
UNAI's  Internal  Communication  Hub  replaces  Slack  and  Microsoft  Teams  with  a  context-aware  
communication
 
layer
 
that
 
understands
 
what
 
is
 
happening
 
across
 
the
 
entire
 
business
 
—
 
and
 
surfaces
 
information
 
intelligently
 
instead
 
of
 
creating
 
more
 
noise.
  
4.7.1  Channels  &  Direct  Messaging  •  Department  channels,  project  channels,  and  team  channels  —  auto-created  from  org  
structure
 •  Direct  messages  and  group  DMs  •  Threads:  keep  conversations  organised  inside  channels  •  Reactions,  mentions  (@user,  @channel,  @here),  and  rich  text  formatting  •  File  sharing  with  preview  and  version  history   
4.7.2  Contextual  Intelligence  •  AI  channel  summaries:  'You  were  away  for  2  days.  Here  is  what  matters  in  #sales-team'  •  Smart  mention  priority:  AI  distinguishes  urgent  @mentions  from  casual  ones  •  Task  context  cards:  when  a  task  is  discussed  in  chat,  the  task  card  is  shown  inline  •  Cross-module  linking:  mention  an  invoice  number,  a  lead  name,  or  a  project  —  UNAI  
shows
 
the
 
relevant
 
card
 •  Auto-answer:  common  repeated  questions  ('What  is  our  leave  policy?')  answered  by  AI  
from
 
Knowledge
 
Brain
  
4.7.3  Smart  Notification  Engine  
Notification  Type Logic Channel 
Urgent  Approval  Requires  action  in  next  2  hours  Push  +  SMS  +  Hub  Routine  Update  FYI  status  updates  Hub  only  (batch  delivered)  AI  Insight  Proactive  prediction  or  alert  Email  +  Hub  Mention  Direct  @mention  in  any  message  Push  +  Hub  Deadline  Approaching  24h  before  task/event  due  Push  +  Email  Daily  Digest  End  of  day  summary  Email  (configurable  time)   
4.7.4  Voice  Notes  &  Async  Communication  •  Record  and  send  voice  notes  in  any  channel  or  DM  •  AI  transcribes  voice  notes  automatically  —  searchable  and  taskable  •  Async  video  messages:  short  loom-style  updates  for  remote  teams  •  Translation:  AI  translates  messages  in  multi-language  teams   
Unai  Member  |  May  2026Page  
21  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
08 
Enterprise  Knowledge  Brain Company  memory  —  SOPs,  policies,  semantic  search  &  AI  Q&A 
 The  UNAI  Knowledge  Brain  is  the  institutional  memory  of  the  company.  Unlike  Notion  (which  
requires
 
humans
 
to
 
organise
 
everything
 
manually),
 
the
 
Knowledge
 
Brain
 
auto-generates
 
and
 
auto-tags
 
content
 
from
 
meetings,
 
emails,
 
and
 
documents
 
—
 
and
 
makes
 
all
 
of
 
it
 
queryable
 
through
 
AI.
  
4.8.1  Knowledge  Repository  •  Document  library:  SOPs,  policies,  handbooks,  guides,  templates  —  all  centralised  •  Rich  text  editor  with  AI  writing  assistance,  formatting,  and  version  control  •  Folders  and  tags  with  AI  auto-categorisation  on  upload  •  Access  control:  Public  to  all,  Department-specific,  Role-specific,  Confidential  •  Document  expiry:  flag  SOPs  for  review  after  configurable  periods   
4.8.2  AI  Knowledge  Generation  •  Meeting-to-SOP:  after  a  process  discussion  meeting,  AI  drafts  the  SOP  automatically  •  Chat-to-FAQ:  AI  identifies  repeated  questions  in  chat  and  generates  a  FAQ  article  •  Document  improvement  suggestions:  'This  policy  hasn't  been  updated  in  18  months  —  
AI
 
suggests
 
revision'
 •  Process  documentation:  record  a  screen  walkthrough  —  AI  generates  a  written  
step-by-step
 
guide
  
4.8.3  Semantic  Search  &  AI  Q&A  •  Vector-powered  semantic  search:  find  documents  by  meaning,  not  just  keywords  •  'How  many  days  of  sick  leave  am  I  entitled  to?'  —  AI  answers  from  the  leave  policy  
instantly
 •  Multi-document  synthesis:  'What  do  our  policies  say  about  WFH?'  —  AI  reads  all  
relevant
 
docs
 
and
 
summarises
 •  Confidence  indicators:  AI  shows  which  source  document  it  used  to  answer  •  Escalation  path:  if  AI  cannot  answer  with  confidence,  it  routes  to  the  right  person   
4.8.4  Onboarding  Knowledge  Paths  •  Role-specific  onboarding  knowledge  tracks:  new  joiners  see  only  relevant  content  •  Completion  tracking:  managers  see  which  knowledge  articles  new  hires  have  read  •  Quizzes:  optional  knowledge  checks  on  critical  compliance  and  policy  documents   
Unai  Member  |  May  2026Page  
22  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
09 
Smart  Automation  Marketplace No-code  automation  builder  &  100+  pre-built  enterprise  automations 
 The  UNAI  Automation  Marketplace  is  the  'Zapier  for  enterprise  operations'  —  but  built  natively  
into
 
the
 
platform
 
with
 
full
 
access
 
to
 
every
 
data
 
point
 
across
 
HRMS,
 
CRM,
 
Finance,
 
and
 
all
 
other
 
modules.
 
No
 
external
 
tools
 
or
 
API
 
keys
 
required.
  
4.9.1  No-Code  Automation  Builder  •  Visual  trigger-action  builder:  select  a  trigger  event,  add  conditions,  define  actions  •  Test  mode:  run  automation  on  sample  data  before  publishing  •  Automation  logs:  every  execution  logged  with  inputs,  outputs,  and  errors  •  Version  history:  roll  back  to  any  previous  automation  version  •  Collaboration:  share  automations  with  team  members  for  editing  or  review   
4.9.2  Pre-Built  Automation  Library  
Category Automation  Name What  It  Does 
HR  Auto  Attendance  Alerts  Notify  HR  if  employee  hasn't  clocked  in  by  10:30  AM  HR  Probation  Confirmation  Auto-generate  confirmation  letter  90  days  after  joining  if  probation  not  reviewed  HR  Birthday  &  Anniversary  Send  personalised  wishes  to  employee  and  post  in  #general  HR  Leave  Balance  Warning  Alert  employee  when  leave  balance  drops  below  2  days  CRM  Lead  Assignment  Auto-assign  new  leads  to  sales  rep  with  lowest  pipeline  load  CRM  Deal  Idle  Alert  Notify  rep  and  manager  if  deal  has  no  activity  for  7  days  CRM  Post-Demo  Follow-up  Send  personalised  follow-up  email  2  hours  after  demo  meeting  ends  Finance  Invoice  Reminder  Send  payment  reminders  at  7,  14,  30  days  overdue  Finance  Expense  Approval  Escalation  
Escalate  to  finance  head  if  expense  not  approved  in  48  hours  
Finance  Monthly  PnL  Alert  Email  CFO  monthly  P&L  summary  on  1st  of  every  month  Tasks  Daily  Standup  Auto-post  form  at  9  AM  for  team  to  submit  standup  updates  Tasks  SLA  Breach  Alert  Alert  if  a  customer-facing  task  exceeds  SLA  threshold  Admin  Asset  Assignment  Create  IT  ticket  when  new  employee  profile  is  created  Admin  Subscription  Renewal  Alert  admin  30  days  before  any  software  subscription  expires   
4.9.3  External  Integrations  
Unai  Member  |  May  2026Page  
23  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Email:  Gmail  and  Outlook  (read,  send,  track)  •  Calendar:  Google  Calendar  and  Outlook  Calendar  (events,  scheduling)  •  Payments:  Razorpay,  Stripe,  PayU  (payment  links,  status  webhooks)  •  Communication:  WhatsApp  Business  API,  SMS  (Twilio),  Email  (SendGrid)  •  Storage:  Google  Drive,  Dropbox  (import/export  documents)  •  Accounting:  Tally  XML  export  (for  companies  using  legacy  Tally)  •  Government:  EPFO  portal  APIs,  MCA21,  GSTN  APIs  for  compliance  •  Webhook  support:  send/receive  data  to/from  any  external  system  via  REST  webhooks   
10 
Executive  Intelligence  Dashboard Live  company  health,  predictive  insights  &  AI-powered  strategic  recommendations 
 The  Executive  Intelligence  Dashboard  is  not  a  collection  of  charts.  It  is  a  live,  AI-narrated  view  
of
 
company
 
health
 
that
 
tells
 
leaders
 
what
 
is
 
happening,
 
why
 
it
 
is
 
happening,
 
and
 
what
 
to
 
do
 
about
 
it
 
—
 
before
 
they
 
even
 
think
 
to
 
ask.
  
4.10.1  Company  Health  Score  •  Single  composite  score  (0–100)  for  overall  company  health  —  refreshed  daily  •  Broken  down  by  dimension:  Financial  Health,  People  Health,  Sales  Health,  Operational  
Health
 •  Trend  line:  is  the  company  improving  or  declining  week  over  week?  •  AI  explanation:  'Health  dropped  6  points  this  week  due  to  3  overdue  client  payments  and  
increased
 
attrition
 
risk
 
signals'
  
4.10.2  Live  KPI  Dashboard  
KPI  Category Metrics  Tracked 
Finance  Monthly  Revenue,  MoM  Growth,  Outstanding  Receivables,  Cash  Runway,  Burn  Rate  Sales  Pipeline  Value,  New  Leads,  Deals  Won/Lost,  Conversion  Rate,  Average  Deal  Size  HR  &  People  Headcount,  Attrition  Rate,  Absenteeism,  Open  Positions,  Engagement  Score  Operations  Task  Completion  Rate,  Overdue  Tasks,  SLA  Compliance,  Automation  Success  Rate  Customer  Active  Clients,  NPS  Score,  Support  Tickets  Open,  Average  Resolution  Time   
4.10.3  AI  Strategic  Recommendations  
Unai  Member  |  May  2026Page  
24  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Weekly  AI  recommendations  based  on  data  patterns:  'Consider  revising  commission  
structure
 
—
 
3
 
top
 
performers
 
have
 
shown
 
attrition
 
signals'
 •  Opportunity  identification:  'Q4  historically  shows  22%  revenue  spike  —  pipeline  needs  
Rs
 
2Cr
 
more
 
to
 
match
 
last
 
year'
 •  Risk  flagging:  'Finance  team  has  2  open  headcount  —  accounts  payable  will  breach  SLA  
in
 
3
 
weeks
 
without
 
hiring'
 •  Benchmarking:  compare  metrics  against  industry  medians  (anonymised  aggregated  
data)
  
4.10.4  Department  Drill-Down  •  Click  on  any  metric  to  drill  down  into  department,  team,  or  individual  level  •  Variance  analysis:  'Which  department  caused  the  deviation  from  plan?'  •  Time-series  analysis:  any  metric  plotted  over  custom  date  ranges  •  Exportable  to  PDF  board  packs  or  PowerPoint  presentations  in  one  click  
  
Unai  Member  |  May  2026Page  
25  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
5.  User  Roles  &  Permissions  
5.1  Role  Hierarchy  
Role Scope Primary  Responsibility 
Super  Admin  Platform-wide  Tenant  management,  billing,  platform  configuration  Company  Owner  /  CEO  Company-wide  Full  company  access,  executive  dashboard,  strategic  settings  CFO  /  Finance  Head  Finance  +  Company  Finance  module,  payroll  oversight,  budget,  compliance  HR  Manager  HR  +  People  HRMS  module,  approvals,  people  analytics  HR  Officer  HR  Operations  Data  entry,  document  verification,  attendance  corrections  Sales  Manager  CRM  +  Company  Full  CRM  access,  pipeline  management,  rep  performance  Sales  Representative  CRM  (Own)  Own  leads,  deals,  contacts,  customer  communication  Department  Manager  Dept  +  Tasks  Team  tasks,  leave  approvals,  attendance,  performance  reviews  Employee  Self-Service  Own  profile,  leave,  attendance,  payslips,  tasks  assigned  to  self  Accountant  Finance  Invoices,  expenses,  bookkeeping,  financial  reports  
 
5.2  Module  Access  Matrix  
Module Super  Admin 
Company  Owner 
CFO HR  Manager 
Sales  Manager 
Employee 
AI  Command  Center  Full  Full  Finance  Scope  
HR  Scope  CRM  Scope  
Self  Scope  
CRM  Full  Full  View  No  Full  No  HRMS  Full  Full  Payroll  View  
Full  Team  Only  Self  Only  
Finance  &  ERP  Full  Full  Full  No  No  Payslip  Only  Task  &  Workflow  Full  Full  Full  Full  Full  Assigned  Tasks  
Unai  Member  |  May  2026Page  
26  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Module Super  Admin 
Company  Owner 
CFO HR  Manager 
Sales  Manager 
Employee 
Meeting  Intelligence  Full  Full  Attended  
Attended  Attended  Attended  
Communication  Hub  Full  Full  Full  Full  Full  Full  Knowledge  Brain  Full  Full  Finance  Docs  
HR  Docs  Sales  Docs  
Public  Docs  Automation  Marketplace  Full  Full  Configure  
Configure  Configure  No  
Exec  Dashboard  Full  Full  Finance  View  
People  View  
Sales  View  
No  
  
Unai  Member  |  May  2026Page  
27  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
6.  Database  Design  Principles  
6.1  Multi-Tenancy  Architecture  •  Row-Level  Security  (RLS)  enforced  at  PostgreSQL  level  —  no  tenant  can  access  
another's
 
data
 •  All  tables  include  tenant_id  as  the  primary  partition  key  •  Super  Admin  uses  elevated  service  role  with  cross-tenant  read  access  •  Tenant  provisioning  is  automated:  new  company  creation  deploys  RLS  policies,  default  
data,
 
and
 
config
  
6.2  Core  Entity  Groups  
Entity  Group Key  Tables Notes 
Identity  &  Auth  tenants,  users,  roles,  permissions,  sessions,  audit_logs  
Multi-tenant  identity  with  RLS  
Organisation  companies,  departments,  designations,  grades,  locations,  shifts  
Company  configuration  tables  
People  employees,  candidates,  contractors,  employee_documents,  emergency_contacts  
Extended  person  profile  
HRMS  Operations  attendance,  leaves,  leave_types,  payroll_runs,  salary_components,  payslips  
Core  HR  transactions  
CRM  contacts,  leads,  deals,  pipelines,  activities,  quotes,  tickets,  accounts  
Sales  and  customer  management  
Finance  invoices,  expenses,  payments,  budgets,  journal_entries,  vendors,  purchase_orders  
Financial  transactions  
Tasks  &  Projects  projects,  epics,  tasks,  sub_tasks,  comments,  attachments,  workflows,  workflow_runs  
Work  management  
Meetings  meetings,  meeting_recordings,  transcripts,  action_items,  meeting_participants  
Meeting  intelligence  
Communication  channels,  messages,  direct_messages,  notifications,  message_reactions  
Internal  comms  
Knowledge  articles,  folders,  article_versions,  search_vectors,  tags,  article_views  
Knowledge  base  
Automations  automation_templates,  automation_instances,  automation_logs,  triggers,  actions  
Workflow  engine  
Unai  Member  |  May  2026Page  
28  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
Entity  Group Key  Tables Notes 
Analytics  events,  kpis,  kpi_values,  reports,  dashboards,  dashboard_widgets  
Metrics  and  reporting  
 
6.3  Vector  Embeddings  Strategy  •  pgvector  extension  for  all  semantic  search  capabilities  •  Embeddings  generated  for:  Knowledge  articles,  Meeting  transcripts,  Employee  profiles,  
CRM
 
contacts/accounts
 •  Embedding  model:  text-embedding-3-large  (OpenAI)  —  3072  dimensions,  stored  as  
vector
 
column
 •  IVFFlat  index  for  fast  approximate  nearest-neighbour  search  at  scale  •  Re-embedding  triggered  automatically  when  source  content  changes  
  
Unai  Member  |  May  2026Page  
29  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
7.  AI  Agent  Architecture  
7.1  Specialised  AI  Agents  UNAI  deploys  a  fleet  of  specialised  AI  agents  that  run  continuously,  subscribe  to  system  events,  
and
 
take
 
actions
 
autonomously.
 
Each
 
agent
 
has
 
a
 
specific
 
domain
 
and
 
context
 
scope.
  Agent  Name Domain Core  Capabilities 
HR  Agent  People  Operations  Attrition  prediction,  burnout  detection,  payroll  anomalies,  recruitment  scoring,  policy  Q&A  Finance  Agent  Financial  Intelligence  Cash  flow  forecasting,  expense  anomaly  detection,  invoice  categorisation,  budget  variance  analysis  CRM  Agent  Sales  Intelligence  Lead  scoring,  deal  prediction,  follow-up  timing,  sentiment  analysis,  churn  risk  detection  Task  Agent  Work  Management  Meeting-to-task  extraction,  dependency  detection,  resource  conflict  identification,  deadline  risk  Meeting  Agent  Meeting  Intelligence  Real-time  transcription,  speaker  ID,  action  item  extraction,  decision  capture,  summary  generation  Knowledge  Agent  Institutional  Memory  Content  indexing,  FAQ  generation,  SOP  drafting,  semantic  search,  Q&A  over  documents  Automation  Agent  Workflow  Orchestration  Trigger  evaluation,  workflow  execution,  error  recovery,  automation  optimisation  Executive  Agent  Strategic  Intelligence  KPI  synthesis,  trend  detection,  strategic  recommendations,  board  pack  generation  Communication  Agent  Information  Flow  Message  summarisation,  notification  prioritisation,  cross-module  context  injection   
7.2  Agent  Communication  Protocol  •  Agents  communicate  via  a  shared  event  bus  (Redis  Pub/Sub)  •  Each  agent  publishes  findings  as  structured  JSON  events:  {  agent,  event_type,  entity_id,  
payload,
 
confidence
 
}
 •  Agents  can  query  each  other's  outputs  via  the  Context  Graph  API  •  Human-in-the-loop:  all  high-stakes  agent  actions  require  confirmation  above  a  
configurable
 
confidence
 
threshold
 •  Agent  audit  log:  every  agent  decision  recorded  with  reasoning,  data  sources,  and  
confidence
 
score
  
Unai  Member  |  May  2026Page  
30  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
7.3  LLM  Strategy  
Use  Case Model Rationale 
General  AI  Copilot  (chat,  Q&A)  GPT-4o  /  Claude  3.5  Sonnet  Best  reasoning  for  complex  queries  Document  OCR  +  Extraction  GPT-4  Vision  +  Tesseract  Multimodal  document  understanding  Meeting  Transcription  OpenAI  Whisper  v3  Best-in-class  STT  accuracy  Meeting  Summarisation  GPT-4o-mini  Cost-efficient  for  high-volume  summarisation  Email  &  Content  Drafting  GPT-4o-mini  /  Claude  Haiku  Fast,  cheap  text  generation  Semantic  Embeddings  text-embedding-3-large  Best  accuracy  for  enterprise  semantic  search  Attrition/Sales  Prediction  Fine-tuned  ML  models  (scikit-learn  /  XGBoost)  
Proprietary  models  trained  on  company  data  
  
Unai  Member  |  May  2026Page  
31  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
8.  Non-Functional  Requirements  
Category Requirement Target 
Performance  API  response  time  (P95)  <  300ms  for  all  CRUD  operations  Performance  AI  query  response  time  <  5  seconds  for  complex  cross-module  queries  Performance  Meeting  transcription  <  60  seconds  after  recording  upload  Scalability  Employees  per  tenant  Up  to  50,000  with  horizontal  scaling  Scalability  Concurrent  users  10,000+  via  Supabase  Realtime  +  Edge  Functions  Availability  Platform  uptime  SLA  99.9%  (<  8.7  hours  downtime/year)  Availability  Failover  recovery  <  2  minutes  via  Kubernetes  auto-healing  Security  Data  encryption  in  transit  TLS  1.3  mandatory  Security  Data  encryption  at  rest  AES-256  for  all  stored  data  Security  Authentication  JWT  +  2FA  mandatory  for  all  admin  roles  Security  Session  management  30-minute  inactivity  timeout,  configurable  Compliance  Indian  regulations  IT  Act  2000,  PDPB  2023,  Indian  labour  law,  GST,  PF,  ESI,  TDS  Compliance  International  GDPR-ready  architecture,  SOC  2  Type  II  roadmap  Backup  Recovery  Point  Objective  <  1  hour  (hourly  snapshots)  Backup  Recovery  Time  Objective  <  4  hours  for  full  tenant  restore  Mobile  Platforms  iOS  15+,  Android  10+,  React  Native  with  offline  mode  Accessibility  Web  standard  WCAG  2.1  Level  AA  for  all  interfaces  AI  SLA  Document  verification  95%  completed  within  30  seconds  
  
Unai  Member  |  May  2026Page  
32  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
9.  UX  Design  Principles  
9.1  Core  Design  Philosophy  
Every  screen  should  reduce  cognitive  load.  If  a  user  has  to  think  about  where  to  find  something  or  how  to  do  something,  the  design  has  failed.  
 
9.1.1  Zero  Training  Required  •  Every  screen  discoverable  within  3  clicks  from  the  home  dashboard  •  Contextual  help  tooltips  on  all  complex  fields  —  no  need  to  read  a  manual  •  AI  onboarding  guide:  'It  looks  like  you  just  joined.  Let  me  show  you  the  3  things  you'll  use  
most'
 •  Role-specific  dashboards:  each  user  sees  only  what  is  relevant  to  their  role  on  login   
9.1.2  Mobile-First  Design  •  Every  screen  designed  for  375px  mobile  width  first,  then  expanded  for  desktop  •  Touch-optimised  interactions:  large  tap  targets,  swipe  gestures,  pull-to-refresh  •  Offline  mode:  employees  can  submit  attendance,  daily  reports,  and  leave  requests  
without
 
connectivity
 •  Progressive  Web  App  (PWA)  +  native  iOS/Android  apps   
9.1.3  AI-First  Interactions  •  Every  screen  has  a  persistent  AI  input  bar  accessible  via  floating  button  •  Voice  input:  employees  can  speak  commands  instead  of  typing  •  Smart  autofill:  forms  pre-populated  from  AI  extraction  of  context  (from  meetings,  emails,  
previous
 
entries)
 •  Predictive  navigation:  'Based  on  your  Monday  morning  pattern,  you  probably  want  to  see  
the
 
weekly
 
digest'
  
9.2  Key  Screen  Designs  
Home  Dashboard  —  Mission  Control  •  AI  feed:  top  5  things  requiring  attention  today,  ranked  by  urgency  •  Company  pulse:  live  health  indicators  —  revenue  trend,  attendance,  open  tasks,  
pending
 
approvals
 •  Quick  action  buttons:  Apply  Leave,  Submit  Report,  Create  Task,  New  Lead,  Add  
Expense
 •  Upcoming  meetings  with  pre-meeting  AI  brief  •  My  Tasks:  overdue,  due  today,  due  this  week  •  Recent  activity:  what  has  changed  since  last  login  
Unai  Member  |  May  2026Page  
33  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
 
Employee  Self-Service  Portal  •  Prominent  clock-in/clock-out  button  with  GPS  status  indicator  •  Leave  balance  cards  —  visual  donut  charts  per  leave  type  •  My  payslips:  latest  3  with  download  button  •  Daily  report:  pre-filled  with  task  suggestions  from  today's  meeting  notes  •  My  goals:  OKR  progress  tracker  with  AI  coaching  suggestions  
  
Unai  Member  |  May  2026Page  
34  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
10.  Development  Roadmap  
10.1  Phase  Plan  (React  +  Supabase  Vibe  Coding)  
Phase Scope Modules Duration 
Phase  1  —  Foundation  Multi-tenant  auth,  RBAC,  company  setup,  employee  profiles,  enhanced  onboarding  
Core  Platform  +  HRMS  Base  
6  Weeks  
Phase  2  —  HR  Complete  
Attendance,  leave,  payroll,  PF/ESI,  document  AI  verification,  payslips,  employee  portal  
HRMS  Full  +  Employee  App  8  Weeks  
Phase  3  —  CRM  Contacts,  deals,  pipeline,  communication  tracking,  quotations,  unified  customer  timeline  
Smart  CRM  Module  6  Weeks  
Phase  4  —  Finance  Invoicing,  expense  management,  GST,  bookkeeping,  vendor  management,  budget  vs  actuals  
Finance  &  ERP  Module  6  Weeks  
Phase  5  —  AI  Command  Center  
Natural  language  interface,  predictive  alerts,  AI  copilot,  cross-module  context  graph  
AI  Command  Center  5  Weeks  
Phase  6  —  Task  &  Workflow  
Projects,  tasks,  Kanban,  Gantt,  dependencies,  autonomous  workflow  engine,  custom  builder  
Smart  Task  &  Workflow  OS  5  Weeks  
Phase  7  —  Meeting  Intelligence  
Meeting  recording  integration,  Whisper  transcription,  action  extraction,  meeting  memory  search  
Meeting  Intelligence  4  Weeks  
Phase  8  —  Communication  
Internal  chat,  channels,  smart  notifications,  AI  summaries,  voice  notes  
Communication  Hub  4  Weeks  
Phase  9  —  Knowledge  &  Automation  
Knowledge  brain,  semantic  search,  AI  Q&A,  automation  marketplace,  pre-built  library  
Knowledge  +  Automation  5  Weeks  
Phase  10  —  Executive  Dashboard  
Live  KPIs,  company  health  score,  AI  recommendations,  board  pack  generation  
Exec  Intelligence  Dashboard  
3  Weeks  
Phase  11  —  QA  &  Hardening  
End-to-end  testing,  performance  testing,  security  audit,  penetration  testing,  UAT  
Platform-wide  QA  4  Weeks  
Phase  12  —  Launch  &  Scale  
Production  deployment,  onboarding  first  10  companies,  support  tooling,  feedback  loops  
GTM  +  Operations  4  Weeks  
Unai  Member  |  May  2026Page  
35  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
 Total  Estimated  Timeline:  60  Weeks  (~15  months)  for  complete  platform.  MVP  (Phases  1–4)  deliverable  in  26  weeks  (~6.5  months)  —  a  fully  functional  HRMS  +  CRM  +  Finance  platform. 
 
10.2  MVP  Definition  The  Minimum  Viable  Product  includes  Phases  1–4  and  delivers:  •  Complete  HRMS:  recruitment,  onboarding,  attendance,  leave,  payroll,  document  AI,  
performance
 •  Smart  CRM:  contacts,  deals,  pipeline,  communication  tracking,  quotations  •  Finance  &  ERP:  invoicing,  expenses,  GST,  bookkeeping,  vendor  management  •  Multi-tenant  platform  with  all  10  user  roles  and  permissions  •  Mobile  apps  (iOS  +  Android)  for  employee  self-service  •  Basic  automation:  20  pre-built  automations  covering  the  most  critical  workflows  
  
Unai  Member  |  May  2026Page  
36  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
11.  Ultra-Advanced  Features  (Differentiators)  
11.1  Digital  Twin  Organisation  A  live,  interactive  visualisation  of  the  company  as  a  graph  —  departments,  employees,  
workflows,
 
reporting
 
structures,
 
data
 
flows,
 
and
 
bottlenecks
 
—
 
all
 
rendered
 
in
 
real
 
time.
 •  Force-directed  graph:  nodes  are  people,  departments,  and  projects;  edges  are  
relationships
 
and
 
workflows
 •  Click  any  node  to  see  health  metrics,  active  tasks,  and  communication  activity  •  Bottleneck  detection:  AI  highlights  nodes  where  too  much  work  is  blocked  •  Org  chart  that  reflects  reality,  not  just  reporting  hierarchy   
11.2  Organisational  Health  Score  
Dimension Input  Signals Score  Weight 
Financial  Health  Revenue  trend,  cash  runway,  payment  delays,  profit  margin  
25%  
People  Health  Attrition  risk,  burnout  signals,  engagement  score,  absenteeism  
25%  
Sales  Health  Pipeline  velocity,  conversion  rate,  customer  churn  risk,  NPS  
20%  
Operational  Health  Task  completion  rate,  SLA  compliance,  automation  efficiency  
15%  
Communication  Health  Meeting  effectiveness,  response  time,  knowledge  usage  rate  
15%  
 
11.3  AI  Operating  Agents  (Autonomous  Mode)  For  companies  that  opt  in,  UNAI  can  run  in  Autonomous  Mode  —  where  AI  agents  handle  
routine
 
decisions
 
without
 
human
 
intervention:
 •  Auto-approve  leave  requests  that  meet  all  policy  criteria  •  Auto-assign  new  leads  based  on  rep  capacity  and  expertise  match  •  Auto-generate  and  send  invoice  reminders  without  finance  team  action  •  Auto-escalate  overdue  tasks  to  manager  when  assignee  is  unresponsive  •  Auto-schedule  candidate  interviews  when  calendar  slots  are  available  All  autonomous  actions  are  logged  and  reversible.  A  daily  digest  summarises  everything  the  AI  
did
 
autonomously.
  
11.4  Predictive  Scenarios  Engine  
Unai  Member  |  May  2026Page  
37  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  'Hire  10  engineers'  →  AI  projects  impact  on  burn  rate,  office  capacity,  and  onboarding  
load
 •  'Expand  to  Bangalore  office'  →  AI  models  headcount  needs,  compliance  requirements,  
and
 
cost
 •  'Launch  new  product  line'  →  AI  projects  required  sales  team  additions  and  training  time  
  
Unai  Member  |  May  2026Page  
38  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
12.  Security  &  Compliance  Framework  
Category Standard  /  Requirement Implementation 
Authentication  Multi-factor  authentication  TOTP  +  SMS  OTP  for  all  admin  roles;  email  magic  link  for  employees  Authorisation  Zero-trust,  least-privilege  RLS  at  database  level  +  API  middleware  RBAC  checks  on  every  request  Data  Privacy  Indian  PDPB  2023  /  GDPR  Data  residency  controls,  right  to  erasure,  consent  management,  DPA  Encryption  TLS  1.3  +  AES-256  Enforced  at  load  balancer;  Supabase  Storage  encryption  at  rest  Audit  Complete  action  logging  Every  create/update/delete  logged  with  user,  timestamp,  IP,  and  before/after  state  Vulnerability  OWASP  Top  10  Automated  SAST  scans  in  CI/CD;  quarterly  penetration  testing  Compliance  (HR)  Indian  Labour  Law  Statutory  PF,  ESI,  PT,  TDS,  Gratuity,  Bonus  Act  rules  built-in  
Compliance  (Finance)  
GST,  Companies  Act  GSTR  filing  templates,  audit  trail,  financial  statement  formats  per  Schedule  III  
Business  Continuity  
99.9%  SLA  Multi-AZ  deployment,  automated  failover,  hourly  backups,  DR  runbooks  Access  Control  IP  Whitelisting  Optional  per-tenant  IP  allowlisting  for  enhanced  enterprise  security  
  
Unai  Member  |  May  2026Page  
39  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
13.  Product  Positioning  &  Go-To-Market  
13.1  Target  Market  
Segment Company  Size Key  Pain  Points UNAI  Value  Proposition 
SMB  20–200  employees  
Using  5–8  disconnected  tools,  admin  overhead,  no  analytics  
All-in-one  at  SMB  price  point,  instant  setup,  zero  admin  burden  Mid-Market  200–2000  employees  
Fragmented  Zoho/HRMS  tools,  manual  reporting,  scaling  pain  
Enterprise  intelligence  at  mid-market  cost,  AI  copilot  for  every  team  Enterprise  2000+  employees  
Workday  +  Salesforce  +  Slack  complexity,  high  IT  costs  
Unified  platform  reducing  tool  sprawl,  custom  enterprise  deployment  Startups  10–50  employees  
Need  systems  but  can't  afford  enterprise  tools,  growth-stage  
Grows  with  them  from  10  to  500  employees  without  migration   
13.2  Pricing  Philosophy  
Per-user  pricing  kills  adoption.  UNAI  should  be  priced  per  company  tier  —  not  per  seat  —  to  incentivise  full  team  adoption  and  drive  viral  growth. 
 Plan Company  Size Modules  Included Price  Signal 
Starter  Up  to  50  employees  
HRMS  +  CRM  +  Basic  Tasks  +  Employee  App  
Affordable  flat  rate  Growth  Up  to  200  employees  
All  Starter  +  Finance  +  Meeting  Intelligence  +  Automation  (20  recipes)  
Mid-tier  flat  rate  
Scale  Up  to  1000  employees  
All  Growth  +  Knowledge  Brain  +  Full  Automation  +  AI  Command  Center  
Premium  flat  rate  
Enterprise  Unlimited  Full  platform  +  Custom  AI  models  +  Dedicated  deployment  +  SLA  
Custom  contract  
 
13.3  India  Market  Positioning  •  First  truly  AI-native  enterprise  OS  built  for  Indian  compliance  and  Indian  business  
workflows
 •  Indian-language  support  roadmap:  Hindi,  Tamil,  Telugu,  Kannada,  Marathi  in  Phase  2  •  WhatsApp-native  —  employees  interact  via  WhatsApp  for  attendance,  leave,  and  
payslips
 •  GST,  PF,  ESI,  PT,  TDS  —  all  Indian  statutory  requirements  built-in,  not  added  on  
Unai  Member  |  May  2026Page  
40  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
•  Tally  migration  tool:  import  existing  chart  of  accounts  and  transaction  history  
  
Unai  Member  |  May  2026Page  
41  

UNAI  Enterprise  Operating  System  —  PRD  v2.0    |     CONFIDENTIAL
 
14.  Glossary  
Term Definition 
EOS  Enterprise  Operating  System  —  the  category  of  software  UNAI  defines  RLS  Row-Level  Security  —  PostgreSQL  feature  ensuring  each  tenant  only  sees  their  data  RBAC  Role-Based  Access  Control  —  permissions  system  tied  to  user  roles  LLM  Large  Language  Model  —  the  AI  model  powering  natural  language  capabilities  pgvector  PostgreSQL  extension  for  storing  and  querying  vector  embeddings  for  semantic  search  Embedding  A  numerical  vector  representation  of  text  used  for  semantic  similarity  search  Diarisation  AI  process  of  identifying  and  labelling  different  speakers  in  a  recording  OKR  Objectives  and  Key  Results  —  goal-setting  framework  used  in  performance  management  FnF  Full  and  Final  Settlement  —  the  final  payroll  processed  when  an  employee  exits  SLA  Service  Level  Agreement  —  agreed  response  or  resolution  time  for  support  tickets  ECR  Electronic  Challan  cum  Return  —  PF  submission  format  required  by  EPFO  GSTR  Goods  and  Services  Tax  Return  —  monthly  GST  filing  document  DPA  Data  Processing  Agreement  —  legal  contract  for  GDPR  compliance  SAST  Static  Application  Security  Testing  —  automated  code  scanning  for  vulnerabilities  Multi-AZ  Multi-Availability  Zone  —  cloud  deployment  across  multiple  geographic  zones  for  resilience  PWA  Progressive  Web  App  —  web  app  installable  on  mobile  with  native-like  capabilities  LangGraph  AI  orchestration  framework  for  building  multi-agent  AI  workflows  BullMQ  Redis-based  job  queue  for  processing  background  tasks  asynchronously  
 
END  OF  DOCUMENT  —  UNAI  Enterprise  OS  PRD  v2.0 CONFIDENTIAL  —  Unai  Member  |  May  2026  |  All  rights  reserved
 
Unai  Member  |  May  2026Page  
42  

