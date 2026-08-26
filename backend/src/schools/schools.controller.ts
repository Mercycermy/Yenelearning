import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateSchoolStudentDto } from './dto/update-school-student.dto';
import { BroadcastSchoolDto } from './dto/broadcast-school.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { StudentNoticeDto } from './dto/student-notice.dto';
import { GenerateStudentCredsDto } from './dto/generate-student-creds.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

interface AuthRequest {
    user: { userId: string; role: string };
}

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
    constructor(private readonly schoolsService: SchoolsService) {}

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createSchoolDto: CreateSchoolDto) {
        return this.schoolsService.create(createSchoolDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    findAll() {
        return this.schoolsService.findAll();
    }

    @Get('domain/:domain')
    findByDomain(@Param('domain') domain: string) {
        return this.schoolsService.findByDomain(domain);
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.schoolsService.getStats();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSchoolDto: UpdateSchoolDto,
    ) {
        return this.schoolsService.update(id, updateSchoolDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.remove(id);
    }

    @Post(':id/provision')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    provisionCredentials(
        @Param('id', ParseUUIDPipe) id: string,
        @Body()
        body: {
            users: {
                email: string;
                firstName: string;
                lastName: string;
                role: UserRole;
            }[];
        },
    ) {
        return this.schoolsService.provisionCredentials(id, body.users);
    }

    @Get(':id/users')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    getSchoolUsers(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.getSchoolUsers(id);
    }

    // ==========================================
    // TEACHER MANAGEMENT
    // ==========================================

    @Get(':id/teachers')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    getSchoolTeachers(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.getSchoolTeachers(id);
    }

    @Post(':id/teachers')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    addSchoolTeacher(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddTeacherDto,
    ) {
        return this.schoolsService.addSchoolTeacher(id, dto);
    }

    @Delete(':id/teachers/:teacherId')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    removeSchoolTeacher(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('teacherId', ParseUUIDPipe) teacherId: string,
    ) {
        return this.schoolsService.removeSchoolTeacher(id, teacherId);
    }

    // ==========================================
    // STUDENT ROSTER & DIRECT MANAGEMENT
    // ==========================================

    @Get(':id/students')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    getSchoolStudents(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.getSchoolStudents(id);
    }

    @Post(':id/students')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    enrollStudent(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: EnrollStudentDto,
    ) {
        return this.schoolsService.enrollStudent(id, dto);
    }

    @Patch(':id/students/:studentId')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    updateSchoolStudent(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Body() dto: UpdateSchoolStudentDto,
    ) {
        return this.schoolsService.updateSchoolStudent(id, studentId, dto);
    }

    @Delete(':id/students/:studentId')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    removeSchoolStudent(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('studentId', ParseUUIDPipe) studentId: string,
    ) {
        return this.schoolsService.removeSchoolStudent(id, studentId);
    }

    @Post(':id/students/:studentId/notice')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    sendStudentNotice(
        @Request() req: AuthRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Body() dto: StudentNoticeDto,
    ) {
        return this.schoolsService.sendStudentNotice(id, studentId, req.user.userId, dto);
    }

    @Post(':id/generate-student-creds')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    generateStudentCredentials(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: GenerateStudentCredsDto,
    ) {
        return this.schoolsService.generateStudentCredentials(id, dto);
    }

    // ==========================================
    // PARENT DIRECTORY & CONTACT MANAGEMENT
    // ==========================================

    @Get(':id/parents')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    getSchoolParents(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.getSchoolParents(id);
    }

    @Patch(':id/parents/:parentId')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
    updateSchoolParent(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('parentId', ParseUUIDPipe) parentId: string,
        @Body() body: { firstName?: string; lastName?: string; isActive?: boolean },
    ) {
        return this.schoolsService.updateSchoolParent(id, parentId, body);
    }

    // ==========================================
    // BROADCAST & DIRECT PARENT CONTACT
    // ==========================================

    @Post(':id/broadcast')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    broadcastMessage(
        @Request() req: AuthRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: BroadcastSchoolDto,
    ) {
        return this.schoolsService.broadcastMessage(id, req.user.userId, dto);
    }

    // ==========================================
    // SCHOOL ANALYTICS
    // ==========================================

    @Get(':id/analytics')
    @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
    getSchoolAnalytics(@Param('id', ParseUUIDPipe) id: string) {
        return this.schoolsService.getSchoolAnalytics(id);
    }
}
