import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from './themeColors';
import logger from '@utils/logger';

export const citiesChatData = [
  {country: 'Spain', value: 940, flag: '🇪🇸'},
  {country: 'USA', value: 900, flag: '🇺🇸'},
  {country: 'UK', value: 830, flag: '🇬🇧'},
  {country: 'Russia', value: 810, flag: '🇷🇺'},
  {country: 'China', value: 740, flag: '🇨🇳'},
  {country: 'Australia', value: 620, flag: '🇦🇺'},
  {country: 'Turkey', value: 480, flag: '🇹🇷'},
  {country: 'Others', value: 450, flag: '🌐'}, // Generic globe icon for 'Others'
];

export const workers = [
  {name: 'Johne Doe', status: 'Leave'},
  {name: 'Brooklyn Simmons', status: 'Present'},
  {name: 'Guy Hawkins', status: 'Absent'},
  {name: 'Robert Fox', status: 'Early Out'},
  {name: 'Robert Fox', status: 'Late Arrival'},
  {name: 'Jacob Jones', status: 'Half Leave'},
];
export const statusStyles = {
  Leave: {
    backgroundColor: '#60A5FA',
    color: '#ffffff',
    icon: <Svgs.mailL height={hp(2)} />,
  },
  Trial: {
    backgroundColor: '#FEA362',
    color: '#ffffff',
    icon: <Svgs.trial height={hp(2)} />,
  },
  Invited: {
    backgroundColor: '#60A5FA',
    color: '#ffffff',
    icon: <Svgs.mailL height={hp(2)} />,
  },
  'Has Issues': {
    backgroundColor: '#9C27B0',
    color: '#ffffff',
    icon: <Svgs.alertOutline height={hp(2)} />,
  },

  Present: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },

  Active: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  Sent: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  Absent: {
    backgroundColor: '#F87171',
    color: '#ffffff',
    icon: <Svgs.CrossOutlineFill height={hp(2)} width={hp(2)} />,
  },
  Inactive: {
    backgroundColor: '#F87171',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  Rejected: {
    backgroundColor: '#D50A0A',
    color: '#ffffff',
    icon: <Svgs.CrossOutlineFill height={hp(2)} />,
  },
  'Early Out': {
    backgroundColor: '#A78BFA',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  'Late Arrival': {
    backgroundColor: '#FB923C',
    color: '#000000',
    icon: <Svgs.CheckOutlineBlack height={hp(2)} />,
  },
  Overdue: {
    backgroundColor: '#FB923C',
    color: '#ffffff',
    icon: <Svgs.delayed height={hp(2)} />,
  },
  'Half Leave': {
    backgroundColor: '#FACC15',
    color: '#000000',
    icon: <Svgs.halfLeave height={hp(2)} />,
  },
  Generated: {
    backgroundColor: '#FACC15',
    color: '#000000',
    icon: <Svgs.halfLeave height={hp(2)} />,
  },
  Request: {
    backgroundColor: '#FACC15',
    color: '#000000',
    icon: <Svgs.halfLeave height={hp(2)} />,
  },
  Valid: {
    backgroundColor: Colors.lightTheme.primaryColor,
    color: '#ffffff',
    icon: <Svgs.lateWhite height={hp(2)} />,
  },
  Invalid: {
    backgroundColor: '#D50A0A',
    color: '#ffffff',
    icon: <Svgs.alertOutline height={hp(2)} />,
  },
  Failed: {
    backgroundColor: '#D50A0A',
    color: '#ffffff',
    icon: <Svgs.crossWhite height={hp(2)} width={hp(2)} />,
  },
  Requested: {
    backgroundColor: '#F5CD47',
    color: '#000000',
    icon: <Svgs.halfLeave height={hp(2)} />,
  },
  Pending: {
    backgroundColor: '#F5CD47',
    color: '#000000',
    icon: <Svgs.ongoingBlack height={hp(2)} />,
  },
  'In Progress': {
    backgroundColor: '#FB923C',
    color: '#ffffff',
    icon: <Svgs.ongoingWhite height={hp(2)} width={hp(2)} />,
  },
  'In-Progress': {
    backgroundColor: '#FB923C',
    color: '#ffffff',
    icon: <Svgs.ongoingWhite height={hp(2)} width={hp(2)} />,
  },
  Cancelled: {
    color: '#ffffff',
    icon: <Svgs.CrossOutlineFill height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F75555',
  },
  Approved: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  Paid: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  Processing: {
    backgroundColor: '#579DFF',
    color: '#ffffff',
    icon: <Svgs.Processing height={hp(2)} />,
  },
  Ongoing: {
    backgroundColor: '#FB923C',
    color: '#ffffff',
    icon: <Svgs.ongoingWhite height={hp(2)} width={hp(2)} />,
  },
  All: {
    backgroundColor: '#ffffff',
    color: '#000000',
    icon: <Svgs.Teams height={hp(2)} width={hp(2)} />,
  },
  Specific: {
    backgroundColor: '#579DFF',
    color: '#ffffff',
    icon: <Svgs.workerWhite height={hp(2)} width={hp(2)} />,
  },
  Assigned: {
    backgroundColor: '#60A5FA',
    color: '#ffffff',
    icon: <Svgs.leaveWhite height={hp(2)} />,
  },
  'Punch In': {
    backgroundColor: '#ffffff',
    color: '#000000',
    icon: <Svgs.checkInSvg height={hp(1.4)} />,
  },
  'Check In': {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  'Check Out': {
    backgroundColor: '#579DFF',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  'Punch Out': {
    backgroundColor: '#ffffff',
    color: '#000000',
    icon: <Svgs.checkOutSvg height={hp(1.4)} />,
  },
  'Break Start': {
    backgroundColor: '#ffffff',
    color: '#000000',
    icon: <Svgs.BreakSvg height={hp(1.4)} />,
  },
  'Break End': {
    backgroundColor: '#ffffff',
    color: '#000000',
    icon: <Svgs.BreakSvg height={hp(1.4)} />,
  },
  Completed: {
    backgroundColor: '#34D399',
    color: '#ffffff',
    icon: <Svgs.CheckOutline height={hp(2)} />,
  },
  'Request Info': {
    backgroundColor: '#FACC15',
    color: '#000000',
    icon: <Svgs.halfLeav height={hp(2)} />,
  },
  Overtime: {
    backgroundColor: Colors.lightTheme.primaryColor,
    color: '#ffffff',
    icon: <Svgs.overtime height={hp(2)} width={hp(2)} />,
  },
};
export const payoutRecordsData = [
  {
    id: '1',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    method: 'PayPal',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '2',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    method: 'Stripe',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '3',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    method: 'Paypal',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '4',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    method: 'Stripe',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '5',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    method: 'Paypal',
    date: '12 May',
    time: '04:00 PM',
  },
  // ... more items
];
export const PaymentManagementNavigateAbleBtmSheetData = [
  {
    id: '1',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '2',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '3',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '4',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '5',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
  },
  // ... more items
];
export const initialNotifications = [
  {
    key: '1',
    type: 'check-in',
    title: 'Worker Check-in',
    name: 'Leslie Alexander',
    time: '06:55 AM',
    location: 'Barefoot Blvd • Storefront lane 3',
    date: '29 Feb 2024',
    isRead: false,
    avatar: '👨‍💼',
  },
  {
    key: '2',
    type: 'task-assigned',
    title: 'Task Assigned Successfully',
    name: 'Facility Maintenance Checklist',
    time: '05:34 AM',
    location: 'Zone B Unit 3 • Storefront lane 3',
    date: 'Yesterday at 10:24 AM',
    isRead: true,
    avatar: '✅',
  },
  {
    key: '3',
    type: 'check-out',
    title: 'Worker Check-Out',
    name: 'Darrell Steward',
    time: '05:12 PM',
    location: 'Workstream Zone 3',
    date: '29 Feb 2024 at 05:12 PM',
    isRead: false,
    avatar: '👨‍🔧',
  },
  {
    key: '4',
    type: 'check-in',
    title: 'Worker Check-in',
    name: 'Carlos Hancock',
    time: '10:12 AM',
    location: 'Scheduled Item at Zone 3',
    date: '28 Feb 2024 at 10:12 AM',
    isRead: false,
    avatar: '👷‍♂️',
  },
  {
    key: '5',
    type: 'task-complete',
    title: 'Task Completed',
    name: 'Emily Chen',
    time: '08:12 AM',
    location: 'Supermart at Zone 2',
    date: '1st Oct, 2024 at 8:12 AM',
    isRead: true,
    avatar: '🏆',
  },
  {
    key: '6',
    type: 'deadline-missed',
    title: 'Deadline Missed',
    name: 'Facility Maintenance',
    time: '11:30 AM',
    location: 'Zone A',
    date: '1st Oct, 2024 at 11:30 AM',
    isRead: false,
    avatar: '⚠️',
  },
];

export const Teams = [
  {name: 'Teams 3', Dep: 'Design Development', status: 'Active'},
  {name: 'Team 2', Dep: 'Design Development', status: 'Active'},
  {name: 'Team 4', Dep: 'Design Development', status: 'Active'},
  {name: 'Team 3', Dep: 'Design Development', status: 'Active'},
  {name: 'Team 1', Dep: 'Design Development', status: 'Inactive'},
  {name: 'Team 2', Dep: 'Design Development', status: 'Active'},
];
export const workerScreenData = [
  {name: 'Brooklyn Simmons', status: 'Invited'},
  {name: 'Zenith Retail Group Pty. Ltd.', status: 'Request'},
  {name: 'Esther Howard', status: 'Invited'},
  {name: 'Jane Cooper', status: 'Active'},
  {name: 'Jacob Jones', status: 'Inactive'},
  {name: 'Robert Fox', status: 'Active'},
  {name: 'John Doe', status: 'Request'},
];
export const AttendanceScreenWorkerData = [
  {name: 'Brooklyn Simmons', status: 'Leave'},
  {name: 'Zenith Retail Group Pty. Ltd.', status: 'Present'},
  {name: 'Esther Howard', status: 'Absent'},
  {name: 'Jane Cooper', status: 'Early Out'},
  {name: 'Jacob Jones', status: 'Late Arrival'},
  {name: 'Robert Fox', status: 'Half Leave'},
  {name: 'John Doe', status: 'Half Leave'},
];
export const DashboardRequestsData = [
  {Request: 'Address updated', status: 'Requested'},
  {Request: 'Sick Leave', status: 'Processing'},
  {Request: 'Travelling Expense', status: 'Approved'},
  {Request: 'House Loan', status: 'Approved'},
  {Request: 'Experience Letter', status: 'Approved'},
];
export const AttendanceRequestsData = [
  {
    name: 'Missed Punch',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {name: 'Sick Leave', date: '12 May', time: '04:00 PM', status: 'Approved'},
  {
    name: 'Urgent Leave',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Annual Leave',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {name: 'Missed Punch', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {name: 'Casual Leave', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {
    name: 'Local Punch Deleted',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Sick Leave',
    date: '12 May',
    time: '04:00 PM',
    status: 'Requested',
  },
];
export const departments = [
  {id: '1', title: 'Design Department'},
  {id: '2', title: 'QA Department'},
  {id: '3', title: 'R&D Department'},
  {id: '4', title: 'Marketing Department'},
  {id: '5', title: 'BA Department'},
  {id: '6', title: 'Development Department'},
];
export const projects = [
  {id: '1', title: 'PR-02-123'},
  {id: '2', title: 'PR-02-123'},
  {id: '3', title: 'PR-02-123'},
  {id: '4', title: 'PR-02-123'},
  {id: '5', title: 'PR-02-123'},
  {id: '6', title: 'PR-02-123'},
];
export const DashboardData = [
  {
    title: 'Present',
    value: 180,
    subText: '↗ 2 new assign this week',
  },
  {
    title: 'Absent',
    value: 180,
    subText: '12 Teams',
  },
  {
    title: 'Late Arrival',
    value: 15,
    subText: '2 attendance, 1 expense, 3 document',
  },
  {
    title: 'Early Out',
    value: 12,
    subText: '↗ +2 added this week',
  },
  {
    title: 'Leave',
    value: 120,
    subText: '↗ +8 more from last month',
  },
  {
    title: 'Half Leave',
    value: 120,
    subText: '↗ +8 more from last month',
  },
];
export const workerData = [
  {name: 'Brooklyn Simmons', status: 'Invited'},
  {name: 'Zenith Retail Group Pty. Ltd.', status: 'Request'},
  {name: 'Esther Howard', status: 'Invited'},
  {name: 'Jane Cooper', status: 'Active'},
  {name: 'Jacob Jones', status: 'Inactive'},
  {name: 'Robert Fox', status: 'Active'},
  {name: 'John Doe', status: 'Request'},
];

export const Departments = [
  {name: 'Design Department', status: 'Active'},
  {name: 'Service Department', status: 'Active'},
  {name: 'Marketing Department', status: 'Active'},
  {name: 'HR Department', status: 'Active'},
  {name: 'Development Department', status: 'Inactive'},
  {name: 'Departamento de Desarrollot', status: 'Active'},
];

export const TaskManagementData = [
  {
    title: 'Assigned Projects',
    value: '180',
    subText: '3 new assign this month',
  },
  {
    title: 'Completed Projects',
    value: '180',
    subText: '+5 more from last month',
  },

  {
    title: 'Ongoing Projects',
    value: '12',
    subText: '2 started this week',
  },
  {
    title: 'Delayed',
    value: '120',
    subText: '-3 delation down from last month',
  },
  {
    title: 'Issue',
    value: '120',
    subText: '3 issues this week',
  },
  {
    title: 'Hold',
    value: '120',
    subText: '1 on hold this week',
  },
];

export const Symbols = {
  Present: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  'Not Done': {
    icon: <Svgs.conflict height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#000000',
  },
  'Late Arrival': {
    icon: <Svgs.lateWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
  },
  'Punch In': {
    icon: <Svgs.checkin />,
    backgroundColor: '#ffffff',
  },
  'Punch Out': {
    icon: <Svgs.checkout />,
    backgroundColor: '#ffffff',
  },
  Absent: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />,
    backgroundColor: '#F75555',
  },
  Cancelled: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />,
    backgroundColor: '#F75555',
  },
  'Late & EarlyOut': {
    icon: <Svgs.LateAndEarlyOut height={hp(3)} width={hp(3)} />,
    backgroundColor: '#F75555',
  },
  Error: {
    icon: <Svgs.alertWhite height={hp(5)} width={hp(5)} />,
    backgroundColor: '#D50A0A',
  },
  Failed: {
    icon: <Svgs.alertWhite height={hp(5)} width={hp(5)} />,
    backgroundColor: '#D50A0A',
  },
  'Early Out': {
    icon: <Svgs.earlyOut height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#B891F3',
  },
  Leave: {
    icon: <Svgs.leaveWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#65B7F3',
  },
  'Half Leave': {
    icon: <Svgs.halfLeav height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FFD645',
  },
  Valid: {
    backgroundColor: Colors.lightTheme.primaryColor,
    icon: <Svgs.lateWhite height={hp(2)} />,
  },
  Overtime: {
    backgroundColor: Colors.lightTheme.primaryColor,
    icon: <Svgs.overtime height={hp(2)} />,
  },
  Invalid: {
    backgroundColor: '#D50A0A',
    icon: <Svgs.alertOutline height={hp(2)} />,
  },
  'Break Start': {
    icon: <Svgs.halfLeav height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FFD645',
  },
  'Break End': {
    icon: <Svgs.halfLeav height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F75555',
  },

  Assigned: {
    icon: <Svgs.leaveWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#65B7F3',
  },
  Completed: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  Ongoing: {
    icon: <Svgs.ongoingWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FB923C',
  },
  Pending: {
    icon: <Svgs.ongoingBlack height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F5CD47',
  },
  Delayed: {
    icon: <Svgs.lateWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F75555',
  },
  Conflict: {
    icon: <Svgs.alertWhite height={hp(5)} width={hp(5)} />,
    backgroundColor: '#FBA64C',
  },
  Hold: {
    icon: <Svgs.hold height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FFD645',
  },
  Approved: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  Rejected: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />,
    backgroundColor: '#F75555',
  },
  Processing: {
    icon: <Svgs.Processing height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#65B7F3',
  },
  Requested: {
    icon: <Svgs.halfLeave height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FFD645',
  },
  Paid: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  'To be Paid': {
    icon: <Svgs.pending height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#65B7F3',
  },
  Active: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  Inactive: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />,
    backgroundColor: '#F75555',
  },
};

export const AttendanceSymbols = ['Pending', 'Valid', 'Invalid'];
export const AttendanceHistorySymbols = [
  'Present',
  'Late & EarlyOut',
  'Overtime',
  'Early Out',
  'Leave',
  'Absent',
  'Late Arrival',
  'Half Leave',
  'Invalid',
];

export const TaskSymbols = [
  'Assigned',
  'Completed',
  'Ongoing',
  'Delayed',
  'Not Done',
];

export const RequestSymbols = [
  'Approved',
  'Rejected',
  'Processing',
  'Requested',
];

export const PaymentsSymbols = ['Paid', 'Error', 'Pending'];
export const ExpenseRequestSymbols = ['Paid', 'Rejected', 'Pending', 'Failed'];
export const ExpensePayrollSymbols = ['Paid', 'Rejected', 'To be Paid'];

export const DocumentsSymbols = ['Active', 'Inactive'];

export const dashboardDataV2 = [
  {
    title: 'Completed Task',
    value: 120,
    subText: '+3 more from last month',
  },
  {
    title: 'Ongoing',
    value: 13,
    subText: '2 started this week',
  },
  {
    title: 'Requests',
    value: 4,
    subText: '1 request this week',
  },
];

export const DepartmentData = [
  {
    title: 'Assigned Task',
    value: 13,
    subText: '2 started this week',
  },
  {
    title: 'Completed Task',
    value: 120,
    subText: '+3 more from last month',
  },

  {
    title: 'Ongoing',
    value: 4,
    subText: '1 request this week',
  },
];

export const attendanceData = [
  {date: '13 May', status: 'Present', time: '09:02 AM – 07:00 PM'},
  {date: '12 May', status: 'Present', time: '09:02 AM – 07:00 PM'},
  {date: '11 May', status: 'Early Out', time: '09:02 AM – 07:00 PM'},
  {date: '10 May', status: 'Early Out', time: '09:02 AM – 07:00 PM'},
  {date: '09 May', status: 'Late Arrival', time: '09:02 AM – 07:00 PM'},
  {date: '08 May', status: 'Late Arrival', time: '09:02 AM – 07:00 PM'},
  {date: '07 May', status: 'Leave', time: '09:02 AM – 07:00 PM'},
  {date: '06 May', status: 'Leave', time: '09:02 AM – 07:00 PM'},
  {date: '05 May', status: 'Absent', time: '09:02 AM – 07:00 PM'},
  {date: '04 May', status: 'Absent', time: '09:02 AM – 07:00 PM'},
  {date: '03 May', status: 'Half Leave', time: '09:02 AM – 07:00 PM'},
  {date: '02 May', status: 'Half Leave', time: '09:02 AM – 07:00 PM'},
  {date: '01 May', status: 'Error', time: '09:02 AM – 07:00 PM'},
];

export const loanData = [
  {
    title: 'Car Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Salary Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Emergency Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Education Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Travel or Relocation Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Housing Loan Assistance',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
  {
    title: 'Personal Loan',
    date: '24, May 2025',
    amount: '12,300',
    installment: '1,025',
  },
];

export const tasksData = [
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Completed'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Completed'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Delayed'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Hold'},
  {id: 'TK-02-123', date: '12 May', time: '04:00 PM', status: 'Assigned'},
];
export const projectsData = [
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Completed'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Completed'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Delayed'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Ongoing'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Hold'},
  {id: 'PR-02-123', date: '12 May', time: '04:00 PM', status: 'Assigned'},
];
export const requestsData = [
  {
    name: 'Address Updated',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {name: 'Sick Leave', date: '12 May', time: '04:00 PM', status: 'Approved'},
  {
    name: 'Name Changed',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {name: 'Loan', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {name: 'Missed Punch', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {
    name: 'Experience Letter',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Increment Letter',
    date: '12 May',
    time: '04:00 PM',
    status: 'Requested',
  },
];
export const InformationRequestsData = [
  {
    name: 'Address Updated',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {name: 'Sick Leave', date: '12 May', time: '04:00 PM', status: 'Approved'},
  {
    name: 'Name Changed',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'NIC Mistake',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {name: 'Name Mistake', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {name: 'NIC Mistake', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {
    name: 'Letter Data Mistake',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'NIC Mistake',
    date: '12 May',
    time: '04:00 PM',
    status: 'Requested',
  },
];
export const expenseData = [
  {
    name: 'Travelling Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {name: 'House Loan', date: '12 May', time: '04:00 PM', status: 'Approved'},
  {
    name: 'Car Loan',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Chair Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {name: 'Personal Loan', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {
    name: 'Educational Loan',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
  {
    name: 'Emergency Loan',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Requested',
  },
];

export const paidExpenseData = [
  {
    name: 'Chair Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {
    name: 'Medical Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {
    name: 'Traversing Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'To be Paid',
  },
  {
    name: 'Travelling Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'To be Paid',
  },
  {name: 'Trip Expense', date: '12 May', time: '04:00 PM', status: 'Rejected'},
  {name: 'Food Expense', date: '12 May', time: '04:00 PM', status: 'Rejected'},
];
export const documentRequestData = [
  {
    name: 'Experience Letter',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {name: 'Contract', date: '12 May', time: '04:00 PM', status: 'Approved'},
  {
    name: 'Pay Slip',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Chair Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Company Policy',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
  {
    name: 'Expense Policy',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
  {
    name: 'Promotion Letter',
    date: '12 May',
    time: '04:00 PM',
    status: 'Processing',
  },
  {
    name: 'Increment Letter',
    date: '12 May',
    time: '04:00 PM',
    status: 'Requested',
  },
];
export const paymentsData = [
  {name: 'Monthly Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {
    name: '$12,300 | Instalment',
    date: '12 May',
    time: '04:00 PM',
    status: 'Paid',
  },
  {name: 'Weekend Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {name: 'House Loan', date: '12 May', time: '04:00 PM', status: 'Pending'},
  {
    name: 'Travelling Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Pending',
  },
  {
    name: 'Extra Work Payment',
    date: '12 May',
    time: '04:00 PM',
    status: 'Error',
  },
  {name: 'Car Loan', date: '12 May', time: '04:00 PM', status: 'Error'},
];

export const paymentsDataForExpenseManagement = [
  {
    worker: 'John',
    amount: '120',
    date: '12 May',
    time: '04:00 PM',
    status: 'Paid',
  },
  {
    worker: 'John',
    amount: '120',
    date: '12 May',
    time: '04:00 PM',
    status: 'Paid',
  },
  {
    worker: 'John',
    amount: '120',
    date: '12 May',
    time: '04:00 PM',
    status: 'Pending',
  },
  {
    worker: 'John',
    date: '12 May',
    time: '04:00 PM',
    status: 'Pending',
    amount: '120',
  },
  {
    worker: 'John',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
    amount: '120',
  },
  {
    worker: 'John',
    amount: '120',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
];
export const ExpensePayrollData = [
  {
    worker: 'Jane Rotanson',
    amount: '120',
    type: 'Salary',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {
    worker: 'Jane Rotanson',
    amount: '120',
    type: 'Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Approved',
  },
  {
    worker: 'Jane Rotanson',
    amount: '120',
    type: 'Salary',
    date: '12 May',
    time: '04:00 PM',
    status: 'To be Paid',
  },
  {
    worker: 'Jane Rotanson',
    date: '12 May',
    amount: '120',
    type: 'Expense',
    time: '04:00 PM',
    status: 'To be Paid',
  },
  {
    worker: 'Jane Rotanson',
    amount: '120',
    type: 'Salary',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
  {
    worker: 'Jane Rotanson',
    amount: '120',
    type: 'Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
];
export const paidLoanData = [
  {name: 'Monthly Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {name: 'Weekend Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {name: 'House Loan', date: '12 May', time: '04:00 PM', status: 'Pending'},
  {
    name: 'Travelling Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Pending',
  },
  {
    name: 'Extra Work Payment',
    date: '12 May',
    time: '04:00 PM',
    status: 'Error',
  },
  {name: 'Car Loan', date: '12 May', time: '04:00 PM', status: 'Error'},
];

export const paymentsDataForPaymentManagement = [
  {name: 'Monthly Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {name: 'Weekend Salary', date: '12 May', time: '04:00 PM', status: 'Paid'},
  {name: 'House Loan', date: '12 May', time: '04:00 PM', status: 'Pending'},
  {
    name: 'Travelling Expense',
    date: '12 May',
    time: '04:00 PM',
    status: 'Pending',
  },
  {
    name: 'Extra Work Payment',
    date: '12 May',
    time: '04:00 PM',
    status: 'Rejected',
  },
  {name: 'Car Loan', date: '12 May', time: '04:00 PM', status: 'Rejected'},
];
export const documentsData = [
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Active'},
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Active'},
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Active'},
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Active'},
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Inactive'},
  {name: 'DO–12 SRS Doc', date: '12 May', time: '04:00 PM', status: 'Inactive'},
];
export const companyPoliciesData = [
  {name: 'Company Policy Agreement', date: '12 May', status: 'Active'},
  {name: 'Expense Policy', date: '12 May', status: 'Active'},
];

export const departmentMembers = [
  {title: 'Brooklyn Simmons', image: Images.placeholderImg},
  {title: 'Jane Cooper', image: Images.placeholderImg},
  {title: 'Jacob Jones', image: Images.placeholderImg},
  {title: 'Robert Fox', image: Images.placeholderImg},
  {title: 'John Doe', image: Images.placeholderImg},
  {title: 'Guy Hawkins', image: Images.placeholderImg},
  {title: 'Esther Howard', image: Images.placeholderImg},
  {title: 'Jane Cooper', image: Images.placeholderImg},
];
export const MyLoanDetailsData = [
  {
    id: 1,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 2,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 3,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 4,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 5,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 6,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 7,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 8,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
  {
    id: 9,
    name: 'Brooklyn Simmons',
    timestamp: '12 May - 04:00 PM',
    avatar: Images.placeholderImg,
  },
];

export const AttendancePunchData = [
  {
    id: 1,
    date: '07 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 2,
    date: '06 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:01 AM – 07:02 PM',
    image: Images.placeholderImg,
    status: 'Valid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 3,
    date: '05 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:00 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 4,
    date: '04 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:03 AM – 06:58 PM',
    image: Images.placeholderImg,
    status: 'Valid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 5,
    date: '03 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:05 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 6,
    date: '02 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 06:55 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 7,
    date: '01 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:04 AM – 07:01 PM',
    image: Images.placeholderImg,
    status: 'Valid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 8,
    date: '30 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:06 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 9,
    date: '29 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:00 AM – 06:59 PM',
    image: Images.placeholderImg,
    status: 'Valid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 10,
    date: '28 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Invalid',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
];
export const AttendanceHistoryData = [
  {
    id: 1,
    date: '07 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Present',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 2,
    date: '06 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:01 AM – 07:02 PM',
    image: Images.placeholderImg,
    status: 'Early Out',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 3,
    date: '05 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:00 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Leave',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 4,
    date: '04 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:03 AM – 06:58 PM',
    image: Images.placeholderImg,
    status: 'Late Arrival',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 5,
    date: '03 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:05 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Half Leave',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 6,
    date: '02 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 06:55 PM',
    image: Images.placeholderImg,
    status: 'Present',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 7,
    date: '01 May, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:04 AM – 07:01 PM',
    image: Images.placeholderImg,
    status: 'Early Out',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 8,
    date: '30 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:06 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Late Arrival',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 9,
    date: '29 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:00 AM – 06:59 PM',
    image: Images.placeholderImg,
    status: 'Leave',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
  {
    id: 10,
    date: '28 April, 2025',
    name: 'Brooklyn Simmons',
    timeRange: '09:02 AM – 07:00 PM',
    image: Images.placeholderImg,
    status: 'Half Leave',
    location: 'Calle Gran Vía, 45, 28013 Madrid, Spain',
  },
];
export const manualPunches = [
  {
    id: '1',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'Missed Punch',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '2',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'System Mainta​ince',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '3',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'System Mainta​ince',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '4',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'System Mainta​ince',
    date: '12 May',
    time: '04:00 PM',
  },
  {
    id: '5',
    name: 'Brooklyn Simmons',
    avatar: Images.placeholderImg,
    reason: 'System Mainta​ince',
    date: '12 May',
    time: '04:00 PM',
  },
  // ... more items
];
