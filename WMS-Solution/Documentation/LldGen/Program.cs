using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using W = DocumentFormat.OpenXml.Wordprocessing;

var outputPath = args.Length > 0 ? args[0] : System.IO.Path.GetFullPath(
    System.IO.Path.Combine(AppContext.BaseDirectory, "../../../../LLD.docx"));
outputPath = System.IO.Path.GetFullPath(outputPath);

var docsDir = System.IO.Path.GetDirectoryName(outputPath)!;
System.IO.Directory.CreateDirectory(docsDir);
var diagDir = System.IO.Path.Combine(docsDir, "Diagrams");
System.IO.Directory.CreateDirectory(diagDir);

Console.WriteLine($"Generating LLD.docx at: {outputPath}");

// ═══ SVG DIAGRAMS ═══
var classSvg = System.IO.Path.Combine(diagDir, "class-diagram.svg");
var seqSvg = System.IO.Path.Combine(diagDir, "sequence-diagram.svg");
var erSvg = System.IO.Path.Combine(diagDir, "entity-relationship.svg");

System.IO.File.WriteAllText(classSvg, @"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 620'>
  <rect width='900' height='620' fill='#f8f9fa' rx='8'/>
  <text x='450' y='35' text-anchor='middle' font-family='Arial,sans-serif' font-size='18' font-weight='bold' fill='#1F4E79'>CLASS DIAGRAM — CORE SERVICE &amp; REPOSITORY LAYER</text>

  <!-- IGenericRepository<T> -->
  <rect x='30' y='60' width='220' height='90' rx='6' fill='#E3F2FD' stroke='#1976D2' stroke-width='1.5'/>
  <text x='140' y='80' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-style='italic' fill='#1976D2'>&lt;&lt;interface&gt;&gt;</text>
  <text x='140' y='95' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#1976D2'>IGenericRepository&lt;T&gt;</text>
  <line x1='40' y1='100' x2='240' y2='100' stroke='#1976D2' stroke-width='0.5'/>
  <text x='40' y='115' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ GetAllAsync(): IEnumerable&lt;T&gt;</text>
  <text x='40' y='128' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ GetByIdAsync(id): T?</text>
  <text x='40' y='141' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ AddAsync(entity): Task</text>

  <!-- GenericRepository<T> -->
  <rect x='30' y='175' width='220' height='85' rx='6' fill='#FFF3E0' stroke='#F57C00' stroke-width='1.5'/>
  <text x='140' y='195' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#F57C00'>GenericRepository&lt;T&gt;</text>
  <line x1='40' y1='200' x2='240' y2='200' stroke='#F57C00' stroke-width='0.5'/>
  <text x='40' y='215' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _context: WmsDbContext</text>
  <text x='40' y='228' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _dbSet: DbSet&lt;T&gt;</text>
  <text x='40' y='241' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ (all IGenericRepository methods)</text>
  <line x1='140' y1='165' x2='140' y2='172' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='137,170 143,175 147,169' fill='#999'/>

  <!-- IUserRepository -->
  <rect x='30' y='285' width='220' height='85' rx='6' fill='#E8F5E9' stroke='#388E3C' stroke-width='1.5'/>
  <text x='140' y='305' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-style='italic' fill='#388E3C'>&lt;&lt;interface&gt;&gt;</text>
  <text x='140' y='318' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#388E3C'>IUserRepository</text>
  <line x1='40' y1='323' x2='240' y2='323' stroke='#388E3C' stroke-width='0.5'/>
  <text x='40' y='338' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ GetByUsernameAsync(): UserLogin?</text>
  <text x='40' y='351' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ AddUserAsync(): Task</text>

  <!-- Services -->
  <rect x='320' y='60' width='240' height='105' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='440' y='80' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>AuthService</text>
  <line x1='330' y1='85' x2='550' y2='85' stroke='#C62828' stroke-width='0.5'/>
  <text x='330' y='100' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _userRepo: IUserRepository</text>
  <text x='330' y='113' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _employeeRepo: IGenericRepository&lt;E&gt;</text>
  <text x='330' y='126' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _roleRepo: IGenericRepository&lt;R&gt;</text>
  <text x='330' y='139' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _jwtService: IJwtService</text>
  <text x='330' y='152' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ LoginAsync() / RegisterAsync()</text>

  <rect x='320' y='180' width='240' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='440' y='200' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>EmployeeService</text>
  <line x1='330' y1='205' x2='550' y2='205' stroke='#C62828' stroke-width='0.5'/>
  <text x='330' y='220' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _employeeRepo / _deptRepo / _roleRepo</text>
  <text x='330' y='233' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ CRUD operations + MapToDtoAsync()</text>

  <rect x='320' y='265' width='240' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='440' y='285' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>AttendanceService</text>
  <line x1='330' y1='290' x2='550' y2='290' stroke='#C62828' stroke-width='0.5'/>
  <text x='330' y='305' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _attendanceRepo / _employeeRepo</text>
  <text x='330' y='318' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ CheckInAsync() / CheckOutAsync()</text>

  <rect x='320' y='350' width='240' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='440' y='370' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>LeaveService</text>
  <line x1='330' y1='375' x2='550' y2='375' stroke='#C62828' stroke-width='0.5'/>
  <text x='330' y='390' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _leaveRepo / _employeeRepo</text>
  <text x='330' y='403' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ CreateAsync() / UpdateStatusAsync()</text>

  <rect x='620' y='60' width='250' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='745' y='80' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>ProjectService</text>
  <line x1='630' y1='85' x2='860' y2='85' stroke='#C62828' stroke-width='0.5'/>
  <text x='630' y='100' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _projectRepo / _allocationRepo</text>
  <text x='630' y='113' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _clientRepo</text>

  <rect x='620' y='145' width='250' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='745' y='165' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>AllocationService</text>
  <line x1='630' y1='170' x2='860' y2='170' stroke='#C62828' stroke-width='0.5'/>
  <text x='630' y='185' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _allocationRepo / _employeeRepo</text>
  <text x='630' y='198' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _projectRepo</text>

  <rect x='620' y='230' width='250' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='745' y='250' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>DashboardService</text>
  <line x1='630' y1='255' x2='860' y2='255' stroke='#C62828' stroke-width='0.5'/>
  <text x='630' y='270' font-family='Arial,sans-serif' font-size='8' fill='#333'>- 6 repository dependencies</text>
  <text x='630' y='283' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ GetDashboardAsync()</text>

  <rect x='620' y='315' width='250' height='70' rx='6' fill='#FCE4EC' stroke='#C62828' stroke-width='1.5'/>
  <text x='745' y='335' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#C62828'>JwtService</text>
  <line x1='630' y1='340' x2='860' y2='340' stroke='#C62828' stroke-width='0.5'/>
  <text x='630' y='355' font-family='Arial,sans-serif' font-size='8' fill='#333'>- _configuration: IConfiguration</text>
  <text x='630' y='368' font-family='Arial,sans-serif' font-size='8' fill='#333'>+ GenerateToken(): string</text>

  <!-- Dependencies -->
  <line x1='250' y1='140' x2='315' y2='105' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='300' y1='217' x2='315' y2='217' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='300' y1='300' x2='315' y2='300' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='300' y1='385' x2='315' y2='385' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='565' y1='95' x2='615' y2='95' stroke='#999' stroke-width='1' stroke-dasharray='4'/>

  <!-- Legend -->
  <rect x='30' y='450' width='840' height='150' rx='6' fill='#fff' stroke='#ccc' stroke-width='1'/>
  <text x='450' y='472' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#333'>Legend</text>
  <rect x='50' y='485' width='30' height='15' fill='#E3F2FD' stroke='#1976D2' stroke-width='1'/>
  <text x='90' y='497' font-family='Arial,sans-serif' font-size='10' fill='#333'>Interface</text>
  <rect x='200' y='485' width='30' height='15' fill='#FFF3E0' stroke='#F57C00' stroke-width='1'/>
  <text x='240' y='497' font-family='Arial,sans-serif' font-size='10' fill='#333'>Implementation Class</text>
  <rect x='420' y='485' width='30' height='15' fill='#FCE4EC' stroke='#C62828' stroke-width='1'/>
  <text x='460' y='497' font-family='Arial,sans-serif' font-size='10' fill='#333'>Service Class</text>
  <line x1='50' y1='520' x2='120' y2='520' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <text x='130' y='523' font-family='Arial,sans-serif' font-size='10' fill='#333'>Dependency (uses)</text>
  <line x1='50' y1='540' x2='120' y2='540' stroke='#999' stroke-width='1' stroke-dasharray='3'/>
  <polygon points='117,537 125,540 117,543' fill='#999'/>
  <text x='130' y='543' font-family='Arial,sans-serif' font-size='10' fill='#333'>Inheritance / Implementation</text>
</svg>");

System.IO.File.WriteAllText(seqSvg, @"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 950 640'>
  <rect width='950' height='640' fill='#f8f9fa' rx='8'/>
  <text x='475' y='35' text-anchor='middle' font-family='Arial,sans-serif' font-size='18' font-weight='bold' fill='#1F4E79'>SEQUENCE DIAGRAM — ATTENDANCE CHECK-IN FLOW</text>

  <!-- Lifelines -->
  <line x1='75' y1='70' x2='75' y2='600' stroke='#333' stroke-width='1.5' stroke-dasharray='6'/>
  <rect x='25' y='50' width='100' height='30' rx='6' fill='#1976D2'/>
  <text x='75' y='70' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-weight='bold' fill='#fff'>Employee</text>

  <line x1='275' y1='70' x2='275' y2='600' stroke='#333' stroke-width='1.5' stroke-dasharray='6'/>
  <rect x='215' y='50' width='120' height='30' rx='6' fill='#388E3C'/>
  <text x='275' y='70' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-weight='bold' fill='#fff'>Angular UI</text>

  <line x1='475' y1='70' x2='475' y2='600' stroke='#333' stroke-width='1.5' stroke-dasharray='6'/>
  <rect x='415' y='50' width='120' height='30' rx='6' fill='#F57C00'/>
  <text x='475' y='70' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-weight='bold' fill='#fff'>AuthController</text>

  <line x1='675' y1='70' x2='675' y2='600' stroke='#333' stroke-width='1.5' stroke-dasharray='6'/>
  <rect x='615' y='50' width='120' height='30' rx='6' fill='#5C6BC0'/>
  <text x='675' y='70' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-weight='bold' fill='#fff'>AuthService</text>

  <line x1='875' y1='70' x2='875' y2='600' stroke='#333' stroke-width='1.5' stroke-dasharray='6'/>
  rect x='825' y='50' width='100' height='30' rx='6' fill='#6A1B9A'/>
  <text x='875' y='70' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' font-weight='bold' fill='#fff'>Database</text>

  <!-- Step 1 -->
  <rect x='55' y='110' width='40' height='20' rx='4' fill='#1976D2'/>
  <text x='75' y='124' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>1</text>
  <line x1='95' y1='120' x2='210' y2='120' stroke='#333' stroke-width='1.5'/>
  <polygon points='207,117 215,120 207,123' fill='#333'/>
  <text x='110' y='115' font-family='Arial,sans-serif' font-size='8' fill='#333'>Click Check In</text>

  <!-- Step 2 -->
  <rect x='255' y='145' width='40' height='20' rx='4' fill='#388E3C'/>
  <text x='275' y='159' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>2</text>
  <line x1='335' y1='155' x2='410' y2='155' stroke='#333' stroke-width='1.5'/>
  <polygon points='407,152 415,155 407,158' fill='#333'/>
  <text x='340' y='150' font-family='Arial,sans-serif' font-size='8' fill='#333'>POST /api/attendance/checkin</text>

  <!-- Step 3 -->
  <rect x='455' y='180' width='40' height='20' rx='4' fill='#F57C00'/>
  <text x='475' y='194' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>3</text>
  <line x1='535' y1='190' x2='610' y2='190' stroke='#333' stroke-width='1.5'/>
  <polygon points='607,187 615,190 607,193' fill='#333'/>
  <text x='540' y='185' font-family='Arial,sans-serif' font-size='8' fill='#333'>CheckInAsync(dto)</text>

  <!-- Step 4 -->
  <rect x='655' y='215' width='40' height='20' rx='4' fill='#5C6BC0'/>
  <text x='675' y='229' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>4</text>
  <line x1='735' y1='225' x2='810' y2='225' stroke='#333' stroke-width='1.5'/>
  <polygon points='807,222 815,225 807,228' fill='#333'/>
  <text x='740' y='220' font-family='Arial,sans-serif' font-size='8' fill='#333'>GetEmployeeById()</text>

  <!-- Step 5 return -->
  <line x1='810' y1='250' x2='740' y2='250' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='743,247 735,250 743,253' fill='#666'/>
  <text x='745' y='248' font-family='Arial,sans-serif' font-size='8' fill='#666'>Employee exists</text>

  <!-- Step 6 -->
  <rect x='655' y='275' width='40' height='20' rx='4' fill='#5C6BC0'/>
  <text x='675' y='289' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>6</text>
  <line x1='735' y1='285' x2='810' y2='285' stroke='#333' stroke-width='1.5'/>
  <polygon points='807,282 815,285 807,288' fill='#333'/>
  <text x='740' y='280' font-family='Arial,sans-serif' font-size='8' fill='#333'>Check existing attendance</text>

  <!-- Step 7 return -->
  <line x1='810' y1='310' x2='740' y2='310' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='743,307 735,310 743,313' fill='#666'/>
  <text x='745' y='308' font-family='Arial,sans-serif' font-size='8' fill='#666'>No active check-in</text>

  <!-- Step 8 -->
  <rect x='655' y='335' width='40' height='20' rx='4' fill='#5C6BC0'/>
  <text x='675' y='349' text-anchor='middle' font-family='Arial,sans-serif' font-size='8' fill='#fff'>8</text>
  <line x1='735' y1='345' x2='810' y2='345' stroke='#333' stroke-width='1.5'/>
  <polygon points='807,342 815,345 807,348' fill='#333'/>
  <text x='740' y='340' font-family='Arial,sans-serif' font-size='8' fill='#333'>Insert Attendance record</text>

  <!-- Step 9 return -->
  <line x1='810' y1='370' x2='740' y2='370' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='743,367 735,370 743,373' fill='#666'/>
  <text x='745' y='368' font-family='Arial,sans-serif' font-size='8' fill='#666'>Record saved</text>

  <!-- Step 10 -->
  <line x1='610' y1='395' x2='540' y2='395' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='543,392 535,395 543,398' fill='#666'/>
  <text x='545' y='393' font-family='Arial,sans-serif' font-size='8' fill='#666'>Return AttendanceDto</text>

  <!-- Step 11 -->
  <line x1='410' y1='420' x2='340' y2='420' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='343,417 335,420 343,423' fill='#666'/>
  <text x='345' y='418' font-family='Arial,sans-serif' font-size='8' fill='#666'>200 OK + AttendanceDto</text>

  <!-- Step 12 -->
  <line x1='210' y1='445' x2='100' y2='445' stroke='#666' stroke-width='1' stroke-dasharray='4'/>
  <polygon points='103,442 95,445 103,448' fill='#666'/>
  <text x='110' y='443' font-family='Arial,sans-serif' font-size='8' fill='#666'>Check-in confirmed</text>

  <!-- alt box -->
  <rect x='440' y='470' width='420' height='120' rx='4' fill='none' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <text x='445' y='485' font-family='Arial,sans-serif' font-size='8' font-style='italic' fill='#999'>alt: Error Path</text>

  <text x='450' y='505' font-family='Arial,sans-serif' font-size='8' fill='#C62828'>[Duplicate check-in] ValidationException → 400 Bad Request</text>
  <text x='450' y='525' font-family='Arial,sans-serif' font-size='8' fill='#C62828'>[Employee not found] ValidationException → 400 Bad Request</text>
  <text x='450' y='545' font-family='Arial,sans-serif' font-size='8' fill='#C62828'>[No check-in for checkout] ValidationException → 400</text>
  <text x='450' y='565' font-family='Arial,sans-serif' font-size='8' fill='#C62828'>[Unauthenticated] UnauthorizedAccessException → 401</text>
  <text x='450' y='585' font-family='Arial,sans-serif' font-size='8' fill='#C62828'>[Not found] KeyNotFoundException → 404</text>
</svg>");

System.IO.File.WriteAllText(erSvg, @"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 850 560'>
  <rect width='850' height='560' fill='#f8f9fa' rx='8'/>
  <text x='425' y='35' text-anchor='middle' font-family='Arial,sans-serif' font-size='18' font-weight='bold' fill='#1F4E79'>ENTITY RELATIONSHIP DIAGRAM</text>

  <!-- Employees -->
  <rect x='30' y='65' width='180' height='130' rx='6' fill='#E3F2FD' stroke='#1976D2' stroke-width='1.5'/>
  <text x='120' y='85' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#1976D2'>Employees</text>
  <line x1='40' y1='95' x2='200' y2='95' stroke='#1976D2' stroke-width='0.5'/>
  <text x='40' y='112' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK EmployeeId (int)</text>
  <text x='40' y='126' font-family='Arial,sans-serif' font-size='9' fill='#333'>FirstName, LastName, Email</text>
  <text x='40' y='140' font-family='Arial,sans-serif' font-size='9' fill='#333'>PhoneNumber, Gender, DOB</text>
  <text x='40' y='154' font-family='Arial,sans-serif' font-size='9' fill='#333'>DOJ, Status, CreatedOn</text>
  <text x='40' y='168' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK DepartmentId → Departments</text>
  <text x='40' y='182' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK RoleId → Roles</text>

  <!-- Attendance -->
  <rect x='270' y='65' width='180' height='115' rx='6' fill='#FFF3E0' stroke='#F57C00' stroke-width='1.5'/>
  <text x='360' y='85' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#F57C00'>Attendances</text>
  <line x1='280' y1='95' x2='440' y2='95' stroke='#F57C00' stroke-width='0.5'/>
  <text x='280' y='112' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK AttendanceId (int)</text>
  <text x='280' y='126' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK EmpId → Employees</text>
  <text x='280' y='140' font-family='Arial,sans-serif' font-size='9' fill='#333'>CheckIn, CheckOut</text>
  <text x='280' y='154' font-family='Arial,sans-serif' font-size='9' fill='#333'>TotalHours, WorkMode</text>
  <text x='280' y='168' font-family='Arial,sans-serif' font-size='9' fill='#333'>AttendanceDate</text>

  <!-- Leaves -->
  <rect x='510' y='65' width='180' height='115' rx='6' fill='#E8EAF6' stroke='#5C6BC0' stroke-width='1.5'/>
  <text x='600' y='85' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#5C6BC0'>Leaves</text>
  <line x1='520' y1='95' x2='680' y2='95' stroke='#5C6BC0' stroke-width='0.5'/>
  <text x='520' y='112' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK LeaveId (int)</text>
  <text x='520' y='126' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK EmpId → Employees</text>
  <text x='520' y='140' font-family='Arial,sans-serif' font-size='9' fill='#333'>LeaveType, Reason, Status</text>
  <text x='520' y='154' font-family='Arial,sans-serif' font-size='9' fill='#333'>FromDate, ToDate</text>
  <text x='520' y='168' font-family='Arial,sans-serif' font-size='9' fill='#333'>AppliedOn, ApprovedBy</text>

  <!-- Relationships row 1 -->
  <line x1='210' y1='125' x2='265' y2='125' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='450' y1='125' x2='505' y2='125' stroke='#999' stroke-width='1' stroke-dasharray='4'/>

  <!-- Projects -->
  <rect x='30' y='245' width='180' height='115' rx='6' fill='#FFEBEE' stroke='#C62828' stroke-width='1.5'/>
  <text x='120' y='265' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#C62828'>Projects</text>
  <line x1='40' y1='275' x2='200' y2='275' stroke='#C62828' stroke-width='0.5'/>
  <text x='40' y='292' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK ProjectId (int)</text>
  <text x='40' y='306' font-family='Arial,sans-serif' font-size='9' fill='#333'>ProjectName, Description</text>
  <text x='40' y='320' font-family='Arial,sans-serif' font-size='9' fill='#333'>StartDate, EndDate</text>
  <text x='40' y='334' font-family='Arial,sans-serif' font-size='9' fill='#333'>Status</text>
  <text x='40' y='348' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK ClientId → Clients</text>

  <!-- Allocations -->
  <rect x='270' y='245' width='180' height='130' rx='6' fill='#E8F5E9' stroke='#388E3C' stroke-width='1.5'/>
  <text x='360' y='265' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#388E3C'>EmployeeProject-</text>
  <text x='360' y='280' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='#388E3C'>Allocations</text>
  <line x1='280' y1='290' x2='440' y2='290' stroke='#388E3C' stroke-width='0.5'/>
  <text x='280' y='307' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK AllocationId (int)</text>
  <text x='280' y='321' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK EmpId → Employees</text>
  <text x='280' y='335' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK ProjectId → Projects</text>
  <text x='280' y='349' font-family='Arial,sans-serif' font-size='9' fill='#333'>AssignedOn, Status</text>
  <text x='280' y='363' font-family='Arial,sans-serif' font-size='9' fill='#333'>CreatedBy, CreateDate</text>

  <!-- Clients -->
  <rect x='510' y='245' width='180' height='100' rx='6' fill='#F3E5F5' stroke='#6A1B9A' stroke-width='1.5'/>
  <text x='600' y='265' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#6A1B9A'>Clients</text>
  <line x1='520' y1='275' x2='680' y2='275' stroke='#6A1B9A' stroke-width='0.5'/>
  <text x='520' y='292' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK ClientId (int)</text>
  <text x='520' y='306' font-family='Arial,sans-serif' font-size='9' fill='#333'>ClientName, Address</text>
  <text x='520' y='320' font-family='Arial,sans-serif' font-size='9' fill='#333'>Phone, Location, Status</text>

  <!-- Relationships row 2 -->
  <line x1='210' y1='300' x2='265' y2='300' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='450' y1='300' x2='505' y2='300' stroke='#999' stroke-width='1' stroke-dasharray='4'/>

  <!-- Users & Roles row 3 -->
  <rect x='30' y='410' width='180' height='100' rx='6' fill='#FCE4EC' stroke='#E91E63' stroke-width='1.5'/>
  <text x='120' y='430' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#E91E63'>UserLogins</text>
  <line x1='40' y1='440' x2='200' y2='440' stroke='#E91E63' stroke-width='0.5'/>
  <text x='40' y='457' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK UserId (int)</text>
  <text x='40' y='471' font-family='Arial,sans-serif' font-size='9' fill='#333'>Username, PasswordHash</text>
  <text x='40' y='485' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK EmployeeId → Employees</text>
  <text x='40' y='499' font-family='Arial,sans-serif' font-size='9' fill='#666'>FK RoleId → Roles</text>

  <rect x='270' y='410' width='180' height='85' rx='6' fill='#E0F7FA' stroke='#00838F' stroke-width='1.5'/>
  <text x='360' y='430' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#00838F'>Roles</text>
  <line x1='280' y1='440' x2='440' y2='440' stroke='#00838F' stroke-width='0.5'/>
  <text x='280' y='457' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK RoleId (int)</text>
  <text x='280' y='471' font-family='Arial,sans-serif' font-size='9' fill='#333'>RoleName, Description</text>

  <rect x='510' y='410' width='180' height='85' rx='6' fill='#FFF8E1' stroke='#F9A825' stroke-width='1.5'/>
  <text x='600' y='430' text-anchor='middle' font-family='Arial,sans-serif' font-size='12' font-weight='bold' fill='#F9A825'>Departments</text>
  <line x1='520' y1='440' x2='680' y2='440' stroke='#F9A825' stroke-width='0.5'/>
  <text x='520' y='457' font-family='Arial,sans-serif' font-size='9' fill='#333'>PK DepartmentId (int)</text>
  <text x='520' y='471' font-family='Arial,sans-serif' font-size='9' fill='#333'>DepartmentName, Description</text>

  <!-- Relationships row 3 -->
  <line x1='120' y1='360' x2='120' y2='405' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
  <line x1='210' y1='450' x2='265' y2='450' stroke='#999' stroke-width='1' stroke-dasharray='4'/>
</svg>");

// ═══ BUILD DOCUMENT ═══
using var doc = WordprocessingDocument.Create(outputPath, WordprocessingDocumentType.Document);
var mainPart = doc.AddMainDocumentPart();
mainPart.Document = new W.Document();
var body = new W.Body();
mainPart.Document.Append(body);

body.Append(new W.SectionProperties(
    new W.PageMargin { Top = 1000, Bottom = 1000, Left = 800, Right = 800, Header = 0, Footer = 0 }
));

var stylesPart = mainPart.AddNewPart<StyleDefinitionsPart>();
stylesPart.Styles = new W.Styles();

var n = new W.Style { Type = W.StyleValues.Paragraph, StyleId = "Normal", Default = true };
n.Append(new W.StyleName { Val = "Normal" });
n.Append(new W.StyleParagraphProperties(new W.SpacingBetweenLines { After = "120", Line = "276", LineRule = W.LineSpacingRuleValues.Auto }));
n.Append(new W.StyleRunProperties(new W.FontSize { Val = "22" }));
stylesPart.Styles.Append(n);

void AddStyle(string id, string name, int fs, string color, bool b, int be, int af, int ol = 9)
{
    var s = new W.Style { Type = W.StyleValues.Paragraph, StyleId = id };
    s.Append(new W.StyleName { Val = name });
    var sp = new W.StyleParagraphProperties(new W.SpacingBetweenLines { Before = be.ToString(), After = af.ToString() });
    if (ol < 9) sp.Append(new W.OutlineLevel { Val = ol });
    s.Append(sp);
    s.Append(new W.StyleRunProperties(new W.Bold { Val = b }, new W.Color { Val = color }, new W.FontSize { Val = fs.ToString() }));
    stylesPart.Styles.Append(s);
}
AddStyle("Title", "Title", 36, "1F4E79", true, 240, 120);
AddStyle("Subtitle", "Subtitle", 24, "2E75B6", false, 60, 200);
AddStyle("H1", "heading 1", 28, "1F4E79", true, 300, 120, 0);
AddStyle("H2", "heading 2", 24, "2E75B6", true, 240, 80, 1);
AddStyle("H3", "heading 3", 22, "333333", true, 200, 60, 2);
AddStyle("H4", "heading 4", 20, "555555", true, 160, 40, 3);

void P(string text, string? s = null, int fontSize = 0)
{
    var p = new W.Paragraph();
    if (s != null) p.ParagraphProperties = new W.ParagraphProperties(new W.ParagraphStyleId { Val = s });
    var run = new W.Run(new W.Text(text) { Space = SpaceProcessingModeValues.Preserve });
    if (fontSize > 0) run.RunProperties = new W.RunProperties(new W.FontSize { Val = (fontSize * 2).ToString() });
    p.Append(run);
    body.Append(p);
}

void Bul(string text, int lv = 0)
{
    body.Append(new W.Paragraph(
        new W.ParagraphProperties(new W.Indentation { Left = (720 + lv * 360).ToString(), Hanging = "360" }, new W.SpacingBetweenLines { Before = "40", After = "40" }),
        new W.Run(new W.Text($"•  {text}") { Space = SpaceProcessingModeValues.Preserve })));
}

void Num(string n, string text)
{
    body.Append(new W.Paragraph(
        new W.ParagraphProperties(new W.Indentation { Left = "720", Hanging = "360" }, new W.SpacingBetweenLines { Before = "40", After = "40" }),
        new W.Run(new W.Text($"{n}  {text}") { Space = SpaceProcessingModeValues.Preserve })));
}

void Brk() => body.Append(new W.Paragraph(new W.Run(new W.Break { Type = W.BreakValues.Page })));

void TblRow(W.Table t, params (string txt, string bg, string fg, bool b)[] cells)
{
    var row = new W.TableRow();
    foreach (var c in cells)
    {
        var para = new W.Paragraph(new W.Run(new W.Text(c.txt) { Space = SpaceProcessingModeValues.Preserve }));
        var tc = new W.TableCell(para);
        tc.TableCellProperties = new W.TableCellProperties(
            new W.Shading { Val = W.ShadingPatternValues.Clear, Color = "auto", Fill = c.bg },
            new W.TableCellVerticalAlignment { Val = W.TableVerticalAlignmentValues.Center });
        var rp = new W.RunProperties(new W.Color { Val = c.fg }, new W.FontSize { Val = "20" });
        if (c.b) rp.Append(new W.Bold());
        tc.Descendants<W.Run>().First().PrependChild(rp);
        row.Append(tc);
    }
    t.Append(row);
}

W.Table MkTbl(string[] hdrs, string hbg, string hfg)
{
    var t = new W.Table();
    t.AppendChild(new W.TableProperties(
        new W.TableBorders(
            new W.TopBorder { Val = W.BorderValues.Single, Size = 4, Color = hbg },
            new W.BottomBorder { Val = W.BorderValues.Single, Size = 4, Color = hbg },
            new W.LeftBorder { Val = W.BorderValues.Single, Size = 4, Color = hbg },
            new W.RightBorder { Val = W.BorderValues.Single, Size = 4, Color = hbg },
            new W.InsideHorizontalBorder { Val = W.BorderValues.Single, Size = 2, Color = "B4C6E7" },
            new W.InsideVerticalBorder { Val = W.BorderValues.Single, Size = 2, Color = "B4C6E7" }),
        new W.TableWidth { Width = "5000", Type = W.TableWidthUnitValues.Pct },
        new W.TableCellMarginDefault(
            new W.TopMargin { Width = "40", Type = W.TableWidthUnitValues.Dxa },
            new W.TableCellLeftMargin { Width = 100, Type = W.TableWidthValues.Dxa },
            new W.BottomMargin { Width = "40", Type = W.TableWidthUnitValues.Dxa },
            new W.TableCellRightMargin { Width = 100, Type = W.TableWidthValues.Dxa })));
    var g = new W.TableGrid();
    foreach (var _ in hdrs) g.Append(new W.GridColumn());
    t.Append(g);
    var hr = new W.TableRow();
    foreach (var h in hdrs)
    {
        var p = new W.Paragraph(new W.Run(new W.Text(h) { Space = SpaceProcessingModeValues.Preserve }));
        var tc = new W.TableCell(p);
        tc.TableCellProperties = new W.TableCellProperties(
            new W.Shading { Val = W.ShadingPatternValues.Clear, Color = "auto", Fill = hbg },
            new W.TableCellVerticalAlignment { Val = W.TableVerticalAlignmentValues.Center });
        tc.Descendants<W.Run>().First().PrependChild(new W.RunProperties(new W.Bold(), new W.Color { Val = hfg }, new W.FontSize { Val = "20" }));
        hr.Append(tc);
    }
    t.Append(hr);
    return t;
}

void Img(string path, long cx, long cy)
{
    var ip = mainPart.AddImagePart(ImagePartType.Svg);
    using var s = System.IO.File.OpenRead(path);
    ip.FeedData(s);
    body.Append(new W.Paragraph(
        new W.ParagraphProperties(new W.Justification { Val = W.JustificationValues.Center }),
        new W.Run(
            new DocumentFormat.OpenXml.Drawing.Wordprocessing.Inline(
                new DocumentFormat.OpenXml.Drawing.Wordprocessing.Extent { Cx = cx, Cy = cy },
                new DocumentFormat.OpenXml.Drawing.Wordprocessing.EffectExtent { LeftEdge = 0, TopEdge = 0, RightEdge = 0, BottomEdge = 0 },
                new DocumentFormat.OpenXml.Drawing.Wordprocessing.DocProperties { Id = (uint)new Random().Next(), Name = "d" },
                new DocumentFormat.OpenXml.Drawing.Pictures.NonVisualPictureProperties(
                    new DocumentFormat.OpenXml.Drawing.Pictures.NonVisualDrawingProperties { Id = 0, Name = "d" },
                    new DocumentFormat.OpenXml.Drawing.Pictures.NonVisualPictureDrawingProperties()),
                new DocumentFormat.OpenXml.Drawing.Pictures.BlipFill(
                    new DocumentFormat.OpenXml.Drawing.Blip { Embed = mainPart.GetIdOfPart(ip), CompressionState = DocumentFormat.OpenXml.Drawing.BlipCompressionValues.Print },
                    new DocumentFormat.OpenXml.Drawing.Stretch(new DocumentFormat.OpenXml.Drawing.FillRectangle())),
                new DocumentFormat.OpenXml.Drawing.Pictures.ShapeProperties(
                    new DocumentFormat.OpenXml.Drawing.Transform2D(new DocumentFormat.OpenXml.Drawing.Offset { X = 0, Y = 0 }, new DocumentFormat.OpenXml.Drawing.Extents { Cx = cx, Cy = cy }),
                    new DocumentFormat.OpenXml.Drawing.PresetGeometry { Preset = DocumentFormat.OpenXml.Drawing.ShapeTypeValues.Rectangle })))));
}

// ═══════════════ TITLE PAGE ═══════════════
P("Workforce Management System", "Title");
P("Low-Level Design Document", "Subtitle"); P("");
P("Version 1.0", fontSize: 22);
P("Prepared By: Development Team");
P("Date: May 2026");
P("___________________________________________________________________");

// ═══ TOC ═══
Brk(); P("Table of Contents", "H1"); P("");
foreach (var x in new[]{
    "1. Project Overview", "2. Layer-wise Design",
    "3. Authentication Module", "4. Employee Module",
    "5. Attendance Module", "6. Leave Module",
    "7. Project Module", "8. Dashboard Module",
    "9. Database Design", "10. Class Diagram", "11. Sequence Diagram",
    "12. Entity Relationship Diagram", "13. Appendix"}) Bul(x);

// ═══ 1. PROJECT OVERVIEW ═══
Brk(); P("1. Project Overview", "H1"); P("");
P("Project Name:", "H3");
P("Workforce Management System (WMS)");
P(""); P("Description:", "H3");
P("WMS is a centralized web application for managing employee data, attendance tracking, leave management, project allocation, and real-time dashboards. It follows a layered architecture with Angular frontend, ASP.NET Core Web API backend, and SQL Server database.");
P(""); P("Key Design Goals:", "H3");
Bul("Modular monolith backend — each concern (auth, employee, attendance, leave, project, dashboard) is a separate service class");
Bul("Repository pattern for data access — all database operations go through IGenericRepository<T>");
Bul("DTOs for API contracts — domain entities never exposed directly to the client");
Bul("JWT-based stateless authentication with role-based authorization");
Bul("Centralized exception handling via middleware");

// ═══ 2. LAYER-WISE DESIGN ═══
Brk(); P("2. Layer-wise Design", "H1"); P("");

P("2.1 Presentation Layer (Angular)", "H2");
P("Components:", "H3");
Bul("AuthComponent — Login/register forms");
Bul("DashboardComponent — Admin/Employee dashboards with charts");
Bul("EmployeeComponent — Employee CRUD management");
Bul("AttendanceComponent — Check-in/out and attendance history");
Bul("LeaveComponent/MyLeaveComponent — Leave application and list views");
Bul("ProjectComponent — Project management and allocation");
P("");
P("Services:", "H3");
Bul("auth.service.ts — login(), register(), token storage");
Bul("employee.service.ts — CRUD operations");
Bul("attendance.service.ts — checkIn(), checkOut(), getHistory()");
Bul("leave.service.ts — apply(), cancel(), updateStatus()");
Bul("project.service.ts — CRUD, allocateEmployee()");
Bul("dashboard.service.ts — getDashboardStats()");
P("");
P("Guards:", "H3");
Bul("AuthGuard — checks JWT presence / expiry before route activation");
Bul("RoleGuard — restricts routes to Admin / Manager roles");
P("");
P("Interceptors:", "H3");
Bul("AuthInterceptor — attaches JWT Bearer token to all HTTP requests");
Bul("ErrorInterceptor — catches HTTP errors and displays notifications");
P("");

P("2.2 API Layer (ASP.NET Core Controllers)", "H2");
var ct = MkTbl(["Controller", "Route", "Methods", "Auth"], "1F4E79", "FFFFFF");
TblRow(ct, ("AuthController", "F2F7FB", "333333", true), ("/api/auth", "F2F7FB", "333333", false), ("POST login, POST register", "F2F7FB", "333333", false), ("Anonymous", "F2F7FB", "333333", false));
TblRow(ct, ("EmployeeController", "FFFFFF", "333333", true), ("/api/employee", "FFFFFF", "333333", false), ("GET, POST, PUT, DELETE", "FFFFFF", "333333", false), ("Authorize", "FFFFFF", "333333", false));
TblRow(ct, ("AttendanceController", "F2F7FB", "333333", true), ("/api/attendance", "F2F7FB", "333333", false), ("POST checkin/checkout, GET", "F2F7FB", "333333", false), ("Authorize", "F2F7FB", "333333", false));
TblRow(ct, ("LeaveController", "FFFFFF", "333333", true), ("/api/leave", "FFFFFF", "333333", false), ("POST, PUT status, PUT cancel", "FFFFFF", "333333", false), ("Authorize", "FFFFFF", "333333", false));
TblRow(ct, ("ProjectController", "F2F7FB", "333333", true), ("/api/project", "F2F7FB", "333333", false), ("POST, PUT, DELETE, GET", "F2F7FB", "333333", false), ("Authorize", "F2F7FB", "333333", false));
TblRow(ct, ("DashboardController", "FFFFFF", "333333", true), ("/api/dashboard", "FFFFFF", "333333", false), ("GET /", "FFFFFF", "333333", false), ("Admin, Manager", "FFFFFF", "333333", false));
TblRow(ct, ("AllocationController", "F2F7FB", "333333", true), ("/api/allocation", "F2F7FB", "333333", false), ("POST, GET, DELETE", "F2F7FB", "333333", false), ("Authorize", "F2F7FB", "333333", false));
body.Append(ct); P("");

P("2.3 Application Layer (Services)", "H2");
P("All services follow the same pattern:", "H3");
Bul("Constructor injection of repository interfaces (IGenericRepository<T>)");
Bul("Each method handles business logic, validation, and mapping");
Bul("Validation exceptions (ValidationException) → HTTP 400");
Bul("Not-found exceptions (KeyNotFoundException) → HTTP 404");
Bul("Auth exceptions (UnauthorizedAccessException) → HTTP 401");
P("");

P("2.4 Infrastructure Layer (Data Access)", "H2");
P("DbContext:", "H3");
Bul("WmsDbContext extends DbContext with 12 DbSet properties");
Bul("OnModelCreating configures unique indexes (Email, Username) and seed data");
P("Repositories:", "H3");
Bul("GenericRepository<T> — implements IGenericRepository<T> for all entities");
Bul("UserRepository — implements IUserRepository for UserLogin-specific queries");
P("Migrations:", "H3");
Bul("EF Core Code-First migrations for schema evolution");
Bul("Seed data creates initial departments (HR, IT, Finance), roles (Admin, Manager, Employee), and test users");

// ═══ 3. AUTH MODULE ═══
Brk(); P("3. Authentication Module", "H1"); P("");
P("Controller:", "H3"); Bul("AuthController — POST /api/auth/login, POST /api/auth/register");
P("Service:", "H3"); Bul("AuthService — LoginAsync(), RegisterAsync()");
P("DTOs:", "H3");
Bul("LoginRequestDto — Username, Password");
Bul("RegisterRequestDto — FirstName, LastName, Email, PhoneNumber, Gender, DOB, DOJ, Username, Password, DepartmentId, RoleId");
Bul("AuthResponseDto — EmployeeId, Username, Role, Token, ExpiresAt");
P("Key Interfaces:", "H3"); Bul("IAuthService, IJwtService, IUserRepository");
P("Business Rules:", "H3");
Bul("Username must be unique");
Bul("Password hashed with BCrypt before storage");
Bul("JWT token generated on successful login/register");
Bul("LastLogin timestamp updated on each login");

// ═══ 4. EMPLOYEE MODULE ═══
P("4. Employee Module", "H1"); P("");
P("Controller:", "H3"); Bul("EmployeeController — GET, GET {id}, POST, PUT {id}, DELETE {id}");
P("Service:", "H3"); Bul("EmployeeService — GetAllAsync(), GetByIdAsync(), CreateAsync(), UpdateAsync(), DeleteAsync()");
P("Entity:", "H3"); Bul("Employee — EmployeeId, FirstName, LastName, Email, PhoneNumber, Gender, DOB, DOJ, DepartmentId, RoleId, Status, CreatedOn, UpdatedOn");
P("DTOs:", "H3"); Bul("EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto");
P("Key Repository Methods:", "H3"); Bul("IGenericRepository<Employee>");
P("Business Rules:", "H3");
Bul("Email must be unique");
Bul("Gender validated via regex ^[MFO]$");
Bul("Status defaults to 'Active'");

// ═══ 5. ATTENDANCE MODULE ═══
P("5. Attendance Module", "H1"); P("");
P("Controller:", "H3"); Bul("AttendanceController — POST checkin, POST checkout, GET all, GET {employeeId}, GET timesheet/{employeeId}");
P("Service:", "H3"); Bul("AttendanceService — CheckInAsync(), CheckOutAsync(), GetAllAsync(), GetByEmployeeIdAsync(), GetTimesheetReportAsync()");
P("Entity:", "H3"); Bul("Attendance — AttendanceId, EmpId, CheckIn, CheckOut, TotalHours, WorkMode, AttendanceDate");
P("DTOs:", "H3"); Bul("CheckInDto, CheckOutDto, AttendanceDto, TimesheetReportDto");
P("Business Rules:", "H3");
Bul("Employee must exist before check-in");
Bul("Only one active (no check-out) attendance per day allowed");
Bul("Check-out requires an existing open check-in");
Bul("TotalHours = Math.Round((CheckOut - CheckIn).TotalHours, 2)");

// ═══ 6. LEAVE MODULE ═══
P("6. Leave Module", "H1"); P("");
P("Controller:", "H3"); Bul("LeaveController — POST, GET all, GET {employeeId}, PUT status/{leaveId}, PUT cancel/{id}, DELETE {id}");
P("Service:", "H3"); Bul("LeaveService — CreateAsync(), GetAllAsync(), GetByEmployeeIdAsync(), UpdateStatusAsync(), CancelAsync()");
P("Entity:", "H3"); Bul("Leave — LeaveId, EmpId, LeaveType, Reason, FromDate, ToDate, Status, AppliedOn, ApprovedBy, ApprovedOn");
P("DTOs:", "H3"); Bul("CreateLeaveDto, LeaveDto, UpdateLeaveStatusDto");
P("Business Rules:", "H3");
Bul("StartDate and EndDate cannot be in the past");
Bul("EndDate must be >= StartDate");
Bul("Overlapping pending leaves are rejected");
Bul("Only Pending leaves can be Approved/Rejected/Cancelled");
Bul("Cancel preserves the record (status = 'Cancelled'), does not delete");
Bul("Employee can only cancel their own leaves");

// ═══ 7. PROJECT MODULE ═══
P("7. Project Module", "H1"); P("");
P("Controller:", "H3"); Bul("ProjectController — POST, PUT {id}, DELETE {id}, GET all, GET {id}, POST allocate, GET employee/{employeeId}");
P("Service:", "H3"); Bul("ProjectService — CreateAsync(), UpdateAsync(), DeleteAsync(), GetAllAsync(), GetByIdAsync(), AllocateEmployeeAsync(), GetProjectsByEmployeeAsync()");
P("Entity:", "H3"); Bul("Project — ProjectId, ProjectName, Description, ClientId, StartDate, EndDate, Status");
P("DTOs:", "H3"); Bul("CreateProjectDto, ProjectDto, AllocateEmployeeDto");
P("Related Service:", "H3");
Bul("AllocationService — CreateAsync(CreateAllocationDto) via /api/allocation");
P("Business Rules:", "H3");
Bul("Project name must be unique (case-insensitive)");
Bul("EndDate >= StartDate");
Bul("Employee cannot be allocated to the same project twice (active allocation)");

// ═══ 8. DASHBOARD MODULE ═══
P("8. Dashboard Module", "H1"); P("");
P("Controller:", "H3"); Bul("DashboardController — GET /api/dashboard");
P("Service:", "H3"); Bul("DashboardService — GetDashboardAsync()");
P("DTO:", "H3"); Bul("DashboardDto — TotalEmployees, ActiveEmployees, TotalProjects, ActiveProjects, TotalClients, TotalAnnouncements, PendingLeaves, TodayAttendanceCount, PresentToday, WfoToday, WfhToday, AbsentToday");
P("Dependencies:", "H3");
Bul("All 6 repositories: Employee, Project, Client, Announcement, Leave, Attendance");
P("Business Rules:", "H3");
Bul("AbsentToday = max(0, ActiveEmployees - PresentToday)");
Bul("All counts computed from real DB queries; no hardcoded values");
Bul("TodayAttendance filtered by AttendanceDate == DateTime.UtcNow.Date");

// ═══ 9. DATABASE DESIGN ═══
Brk(); P("9. Database Design", "H1"); P("");

var dbT = MkTbl(["Table", "PK", "FK References", "Key Columns"], "1F4E79", "FFFFFF");
var dbRows = new (string,string,string,string)[] {
    ("Employees", "EmployeeId", "DepartmentId → Departments, RoleId → Roles", "FirstName, LastName, Email, PhoneNumber, Gender, DOB, DOJ, Status"),
    ("Departments", "DepartmentId", "—", "DepartmentName, Description, CreatedOn"),
    ("Roles", "RoleId", "—", "RoleName, Description"),
    ("UserLogins", "UserId", "EmployeeId → Employees, RoleId → Roles", "Username, PasswordHash, LastLogin"),
    ("Attendances", "AttendanceId", "EmpId → Employees", "CheckIn, CheckOut, TotalHours, WorkMode, AttendanceDate"),
    ("Leaves", "LeaveId", "EmpId → Employees", "LeaveType, Reason, FromDate, ToDate, Status, AppliedOn, ApprovedBy"),
    ("Projects", "ProjectId", "ClientId → Clients", "ProjectName, Description, StartDate, EndDate, Status"),
    ("EmployeeProjectAllocations", "AllocationId", "EmpId → Employees, ProjectId → Projects", "AssignedOn, CreateDate, CreatedBy, Status"),
    ("Clients", "ClientId", "—", "ClientName, ClientAddress, ClientPhoneNumber, ClientLocation, Status"),
    ("Announcements", "AnnouncementId", "CreatedBy → Employees", "Title, Message, CreatedOn, IsActive"),
    ("Notifications", "NotificationId", "EmployeeId → Employees", "Type, Title, Message, CreatedAt, IsRead"),
    ("AuditLogs", "AuditId", "CreatedBy → Employees", "EntityName, RecordId, Action"),
};
bool ev = false;
foreach (var (tb, pk, fk, cols) in dbRows)
{
    var bg = ev ? "F2F7FB" : "FFFFFF";
    TblRow(dbT, (tb, bg, "333333", true), (pk, bg, "333333", false), (fk, bg, "333333", false), (cols, bg, "333333", false));
    ev = !ev;
}
body.Append(dbT); P("");

P("9.1 Key Relationships", "H2");
Bul("Employees → Attendances: 1-to-many (EmpId FK)");
Bul("Employees → Leaves: 1-to-many (EmpId FK)");
Bul("Employees → EmployeeProjectAllocations: 1-to-many (EmpId FK)");
Bul("Projects → EmployeeProjectAllocations: 1-to-many (ProjectId FK)");
Bul("Projects → Clients: many-to-1 (ClientId FK)");
Bul("Employees → UserLogins: 1-to-1 (EmployeeId FK)");
Bul("Roles → UserLogins: 1-to-many (RoleId FK)");
Bul("Departments → Employees: 1-to-many (DepartmentId FK)");

// ═══ 10. CLASS DIAGRAM ═══
Brk(); P("10. Class Diagram", "H1"); P("");
P("The class diagram below shows the core service classes, repository interfaces, and their relationships:");
if (System.IO.File.Exists(classSvg)) Img(classSvg, 8700000, 6000000);

// ═══ 11. SEQUENCE DIAGRAM ═══
Brk(); P("11. Sequence Diagram — Attendance Check-In", "H1"); P("");
P("The sequence diagram below illustrates the complete flow of the attendance check-in operation, from the employee clicking the button to the database insert, including the error path alternatives:");
if (System.IO.File.Exists(seqSvg)) Img(seqSvg, 9200000, 6200000);

// ═══ 12. ER DIAGRAM ═══
Brk(); P("12. Entity Relationship Diagram", "H1"); P("");
P("The ER diagram below shows all entities, their primary keys, foreign key relationships, and key columns:");
if (System.IO.File.Exists(erSvg)) Img(erSvg, 8200000, 5400000);

// ═══ 13. APPENDIX ═══
Brk(); P("13. Appendix", "H1"); P("");
P("13.1 Project Structure", "H2");
Bul("WMS.Domain/ — Entities (Employee, Attendance, Leave, Project, etc.) and repository interfaces");
Bul("WMS.Application/ — DTOs, service interfaces, service implementations");
Bul("WMS.Infrastructure/ — DbContext, GenericRepository<T>, UserRepository, EF Migrations");
Bul("WMS.API/ — Controllers, middleware, Program.cs, SeedData");
Bul("WMS.Tests/ — xUnit unit tests for all 6 service modules");
Bul("wms-frontend/ — Angular 18 SPA");
P("");
P("13.2 Key NuGet Packages (Backend)", "H2");
Bul("Microsoft.EntityFrameworkCore (10.0.8) — ORM");
Bul("Microsoft.AspNetCore.Authentication.JwtBearer — JWT auth");
Bul("BCrypt.Net-Next (4.2.0) — Password hashing");
Bul("Swashbuckle.AspNetCore — Swagger / OpenAPI");
P("");
P("13.3 Key NPM Packages (Frontend)", "H2");
Bul("@angular/core (18) — SPA framework");
Bul("@angular/material — UI components");
Bul("chart.js (4.4) — Interactive charts");
Bul("rxjs (7.8) — Reactive state management");
P("");
P("13.4 Revision History", "H2");
var rh = MkTbl(["Version", "Date", "Author", "Changes"], "1F4E79", "FFFFFF");
TblRow(rh, ("1.0", "F2F7FB", "333333", true), ("May 24, 2026", "F2F7FB", "333333", false), ("Development Team", "F2F7FB", "333333", false), ("Initial LLD document", "F2F7FB", "333333", false));
body.Append(rh);
P(""); P("— End of Document —");

mainPart.Document.Save();
Console.WriteLine($"LLD generated: {outputPath}");
