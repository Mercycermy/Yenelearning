import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { School } from '../entities/school.entity';
import { User, UserRole } from '../entities/user.entity';
import { Child, GradeLevel, SupportedLanguage } from '../entities/child.entity';
import { Message } from '../entities/message.entity';
import { Progress } from '../entities/progress.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateSchoolStudentDto } from './dto/update-school-student.dto';
import { BroadcastSchoolDto } from './dto/broadcast-school.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { StudentNoticeDto } from './dto/student-notice.dto';
import { GenerateStudentCredsDto } from './dto/generate-student-creds.dto';

@Injectable()
export class SchoolsService {
    constructor(
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Child)
        private readonly childRepository: Repository<Child>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
    ) {}

    async create(createSchoolDto: CreateSchoolDto): Promise<School> {
        const existing = await this.schoolRepository.findOne({
            where: { code: createSchoolDto.code },
        });
        if (existing) {
            throw new ConflictException('School with this code already exists');
        }

        if (createSchoolDto.domain) {
            const existingDomain = await this.schoolRepository.findOne({
                where: { domain: createSchoolDto.domain.toLowerCase().trim() },
            });
            if (existingDomain) {
                throw new ConflictException('School with this domain/slug already exists');
            }
        }

        const school = this.schoolRepository.create({
            ...createSchoolDto,
            domain: createSchoolDto.domain?.toLowerCase().trim(),
        });
        return this.schoolRepository.save(school);
    }

    async findAll(): Promise<School[]> {
        return this.schoolRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<School> {
        const school = await this.schoolRepository.findOne({ where: { id } });
        if (!school) {
            throw new NotFoundException('School not found');
        }
        return school;
    }

    async findByDomain(domain: string): Promise<School> {
        const cleanDomain = domain.toLowerCase().trim();
        let school = await this.schoolRepository.findOne({
            where: { domain: cleanDomain },
        });

        if (!school) {
            school = await this.schoolRepository.findOne({
                where: { code: domain.toUpperCase() },
            });
        }

        if (!school) {
            // Check if it matches UUID id
            school = await this.schoolRepository.findOne({
                where: { id: domain },
            });
        }

        if (!school) {
            throw new NotFoundException(`School with domain or identifier '${domain}' not found`);
        }
        return school;
    }

    async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
        const school = await this.findOne(id);
        if (updateSchoolDto.domain && updateSchoolDto.domain !== school.domain) {
            const existingDomain = await this.schoolRepository.findOne({
                where: { domain: updateSchoolDto.domain.toLowerCase().trim() },
            });
            if (existingDomain && existingDomain.id !== id) {
                throw new ConflictException('Domain is already taken by another school');
            }
            updateSchoolDto.domain = updateSchoolDto.domain.toLowerCase().trim();
        }
        Object.assign(school, updateSchoolDto);
        return this.schoolRepository.save(school);
    }

    async remove(id: string): Promise<void> {
        const school = await this.findOne(id);
        await this.schoolRepository.remove(school);
    }

    async provisionCredentials(
        schoolId: string,
        users: { email: string; firstName: string; lastName: string; role: UserRole }[],
    ): Promise<{ created: number; skipped: number; credentials: { email: string; password: string }[] }> {
        const school = await this.findOne(schoolId);

        const availableLicenses = school.licenseCount - school.usedLicenses;
        if (availableLicenses < users.length) {
            throw new ConflictException(
                `Not enough licenses. Available: ${availableLicenses}, Requested: ${users.length}`,
            );
        }

        let created = 0;
        let skipped = 0;
        const credentials: { email: string; password: string }[] = [];

        for (const userData of users) {
            const existing = await this.userRepository.findOne({
                where: { email: userData.email },
            });
            if (existing) {
                // If user exists, ensure they are linked to this school
                if (!existing.schoolId) {
                    existing.schoolId = schoolId;
                    await this.userRepository.save(existing);
                }
                skipped++;
                continue;
            }

            // Generate a random password
            const password = this.generatePassword();
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = this.userRepository.create({
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                schoolId: schoolId,
            });

            await this.userRepository.save(user);
            credentials.push({ email: userData.email, password });
            created++;
        }

        // Update used licenses
        school.usedLicenses += created;
        await this.schoolRepository.save(school);

        return { created, skipped, credentials };
    }

    async getSchoolUsers(schoolId: string): Promise<User[]> {
        await this.findOne(schoolId);
        return this.userRepository.find({
            where: { schoolId },
            order: { createdAt: 'DESC' },
        });
    }

    // ==========================================
    // STUDENT ROSTER & DIRECT MANAGEMENT
    // ==========================================

    async getSchoolStudents(schoolId: string): Promise<Child[]> {
        await this.findOne(schoolId);
        return this.childRepository.find({
            where: { schoolId },
            relations: ['parent'],
            order: { createdAt: 'DESC' },
        });
    }

    async enrollStudent(schoolId: string, dto: EnrollStudentDto): Promise<{ student: Child; credentials?: { email: string; password: string } }> {
        const school = await this.findOne(schoolId);

        let parentId = dto.parentId;
        let generatedCredentials: { email: string; password: string } | undefined;

        // Auto-resolve or create parent if parentEmail provided
        if (!parentId && dto.parentEmail) {
            let parent = await this.userRepository.findOne({
                where: { email: dto.parentEmail },
            });

            if (!parent) {
                const password = this.generatePassword();
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(password, salt);

                parent = this.userRepository.create({
                    email: dto.parentEmail,
                    password: hashedPassword,
                    firstName: dto.parentFirstName || 'Parent of',
                    lastName: dto.parentLastName || dto.name,
                    role: UserRole.PARENT,
                    schoolId: schoolId,
                });
                await this.userRepository.save(parent);
                generatedCredentials = { email: dto.parentEmail, password };
            } else if (!parent.schoolId) {
                parent.schoolId = schoolId;
                await this.userRepository.save(parent);
            }
            parentId = parent.id;
        }

        if (!parentId) {
            // Find default school admin or create a placeholder parent for unassigned students
            const schoolAdmin = await this.userRepository.findOne({
                where: { schoolId, role: UserRole.SCHOOL_ADMIN },
            });
            if (schoolAdmin) {
                parentId = schoolAdmin.id;
            } else {
                const adminUser = await this.userRepository.findOne({
                    where: { role: UserRole.ADMIN },
                });
                parentId = adminUser?.id || '';
            }
        }

        const student = this.childRepository.create({
            name: dto.name,
            age: dto.age,
            grade: dto.grade || GradeLevel.KG,
            currentLanguage: dto.currentLanguage,
            dailyTimeLimitMinutes: dto.dailyTimeLimitMinutes || 30,
            schoolId: schoolId,
            parentId: parentId,
        });

        const savedStudent = await this.childRepository.save(student);

        // Update license count if needed
        school.usedLicenses = Math.min(school.licenseCount, school.usedLicenses + 1);
        await this.schoolRepository.save(school);

        return { student: savedStudent, credentials: generatedCredentials };
    }

    async updateSchoolStudent(schoolId: string, studentId: string, dto: UpdateSchoolStudentDto): Promise<Child> {
        const student = await this.childRepository.findOne({
            where: { id: studentId, schoolId },
            relations: ['parent'],
        });
        if (!student) {
            throw new NotFoundException('Student not found in this school');
        }

        Object.assign(student, dto);
        return this.childRepository.save(student);
    }

    async removeSchoolStudent(schoolId: string, studentId: string): Promise<void> {
        const student = await this.childRepository.findOne({
            where: { id: studentId, schoolId },
        });
        if (!student) {
            throw new NotFoundException('Student not found in this school');
        }

        await this.childRepository.remove(student);

        const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
        if (school && school.usedLicenses > 0) {
            school.usedLicenses = Math.max(0, school.usedLicenses - 1);
            await this.schoolRepository.save(school);
        }
    }

    // ==========================================
    // PARENT DIRECTORY & CONTACT MANAGEMENT
    // ==========================================

    async getSchoolParents(schoolId: string): Promise<Array<User & { childrenCount: number }>> {
        await this.findOne(schoolId);
        const parents = await this.userRepository.find({
            where: { schoolId, role: UserRole.PARENT },
            relations: ['children'],
            order: { createdAt: 'DESC' },
        });

        return parents.map((p) => ({
            ...p,
            childrenCount: p.children?.length || 0,
        }));
    }

    async updateSchoolParent(
        schoolId: string,
        parentId: string,
        data: { firstName?: string; lastName?: string; isActive?: boolean },
    ): Promise<User> {
        const parent = await this.userRepository.findOne({
            where: { id: parentId, schoolId },
        });
        if (!parent) {
            throw new NotFoundException('Parent not found in this school');
        }
        Object.assign(parent, data);
        return this.userRepository.save(parent);
    }

    // ==========================================
    // SCHOOL BROADCAST & PARENT COMMUNICATION
    // ==========================================

    async broadcastMessage(
        schoolId: string,
        senderId: string,
        dto: BroadcastSchoolDto,
    ): Promise<{ delivered: number; recipients: string[] }> {
        const school = await this.findOne(schoolId);

        let targetParents: User[] = [];

        if (dto.targetParentId) {
            const singleParent = await this.userRepository.findOne({
                where: { id: dto.targetParentId, schoolId },
            });
            if (singleParent) {
                targetParents = [singleParent];
            }
        } else if (dto.targetGrade) {
            // Find students in this grade under this school
            const students = await this.childRepository.find({
                where: { schoolId, grade: dto.targetGrade as GradeLevel },
                relations: ['parent'],
            });
            const parentMap = new Map<string, User>();
            students.forEach((s) => {
                if (s.parent && !parentMap.has(s.parent.id)) {
                    parentMap.set(s.parent.id, s.parent);
                }
            });
            targetParents = Array.from(parentMap.values());
        } else {
            // All parents in this school
            targetParents = await this.userRepository.find({
                where: { schoolId, role: UserRole.PARENT },
            });
        }

        if (targetParents.length === 0) {
            return { delivered: 0, recipients: [] };
        }

        const messages = targetParents.map((parent) =>
            this.messageRepository.create({
                senderId: senderId,
                recipientId: parent.id,
                subject: `[${school.name}] ${dto.subject}`,
                body: dto.body,
                isRead: false,
            }),
        );

        await this.messageRepository.save(messages);

        return {
            delivered: messages.length,
            recipients: targetParents.map((p) => p.email),
        };
    }

    // ==========================================
    // SCHOOL-WIDE PERFORMANCE ANALYTICS
    // ==========================================

    async getSchoolAnalytics(schoolId: string): Promise<{
        totalStudents: number;
        totalParents: number;
        totalTeachers: number;
        licenseUsage: { total: number; used: number; percentage: number };
        gradeDistribution: Record<string, number>;
        totalStarsEarned: number;
        totalLearningMinutes: number;
    }> {
        const school = await this.findOne(schoolId);
        const students = await this.childRepository.find({ where: { schoolId } });
        const parentsCount = await this.userRepository.count({ where: { schoolId, role: UserRole.PARENT } });
        const teachersCount = await this.userRepository.count({ where: { schoolId, role: UserRole.TEACHER } });

        const gradeDistribution: Record<string, number> = {
            kg: 0,
            grade_1: 0,
            grade_2: 0,
            grade_3: 0,
            grade_4: 0,
        };

        let totalStars = 0;
        let totalTimeMinutes = 0;

        students.forEach((s) => {
            const g = s.grade || 'kg';
            gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
            totalStars += s.totalStars || 0;
            totalTimeMinutes += s.totalTimeSpentMinutes || 0;
        });

        const usagePercentage = school.licenseCount > 0
            ? Math.round((school.usedLicenses / school.licenseCount) * 100)
            : 0;

        return {
            totalStudents: students.length,
            totalParents: parentsCount,
            totalTeachers: teachersCount,
            licenseUsage: {
                total: school.licenseCount,
                used: school.usedLicenses,
                percentage: usagePercentage,
            },
            gradeDistribution,
            totalStarsEarned: totalStars,
            totalLearningMinutes: totalTimeMinutes,
        };
    }

    async getStats(): Promise<{
        totalSchools: number;
        activeSchools: number;
        totalLicenses: number;
        usedLicenses: number;
    }> {
        const schools = await this.schoolRepository.find();
        return {
            totalSchools: schools.length,
            activeSchools: schools.filter((s) => s.isActive).length,
            totalLicenses: schools.reduce((sum, s) => sum + s.licenseCount, 0),
            usedLicenses: schools.reduce((sum, s) => sum + s.usedLicenses, 0),
        };
    }

    // ==========================================
    // TEACHER MANAGEMENT
    // ==========================================

    async getSchoolTeachers(schoolId: string): Promise<User[]> {
        await this.findOne(schoolId);
        return this.userRepository.find({
            where: { schoolId, role: UserRole.TEACHER },
            order: { createdAt: 'DESC' },
        });
    }

    async addSchoolTeacher(schoolId: string, dto: AddTeacherDto): Promise<{ teacher: User; tempPassword?: string }> {
        await this.findOne(schoolId);

        const existing = await this.userRepository.findOne({
            where: { email: dto.email.toLowerCase().trim() },
        });

        if (existing) {
            if (existing.schoolId && existing.schoolId !== schoolId) {
                throw new ConflictException('Teacher is already assigned to another school');
            }
            existing.schoolId = schoolId;
            existing.role = UserRole.TEACHER;
            const updated = await this.userRepository.save(existing);
            return { teacher: updated };
        }

        const password = dto.password || this.generatePassword();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const teacher = this.userRepository.create({
            email: dto.email.toLowerCase().trim(),
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole.TEACHER,
            schoolId: schoolId,
        });

        const saved = await this.userRepository.save(teacher);
        return { teacher: saved, tempPassword: dto.password ? undefined : password };
    }

    async removeSchoolTeacher(schoolId: string, teacherId: string): Promise<void> {
        const teacher = await this.userRepository.findOne({
            where: { id: teacherId, schoolId, role: UserRole.TEACHER },
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found in this school');
        }
        await this.userRepository.remove(teacher);
    }

    // ==========================================
    // INDIVIDUAL STUDENT NOTICES & ACADEMIC UPDATES
    // ==========================================

    async sendStudentNotice(
        schoolId: string,
        studentId: string,
        senderId: string,
        dto: StudentNoticeDto,
    ): Promise<{ delivered: boolean; parentEmail: string; messageId: string }> {
        const school = await this.findOne(schoolId);
        const student = await this.childRepository.findOne({
            where: { id: studentId, schoolId },
            relations: ['parent'],
        });

        if (!student) {
            throw new NotFoundException('Student not found in this school');
        }

        if (!student.parent) {
            throw new NotFoundException('Student does not have a linked parent account');
        }

        let bodyText = dto.body;
        if (dto.includeProgressSummary) {
            bodyText += `\n\n--- 📊 Academic Progress Summary ---\n• Grade: ${student.grade?.toUpperCase() || 'KG'}\n• Stars Earned: ${student.totalStars || 0} ⭐\n• Active Study Time: ${student.totalTimeSpentMinutes || 0} minutes\n• Preferred Language: ${student.currentLanguage || 'Amharic'}`;
        }

        const message = this.messageRepository.create({
            senderId: senderId,
            recipientId: student.parent.id,
            subject: `[${school.name}] Notice regarding ${student.name}: ${dto.subject}`,
            body: bodyText,
            isRead: false,
        });

        const saved = await this.messageRepository.save(message);

        return {
            delivered: true,
            parentEmail: student.parent.email,
            messageId: saved.id,
        };
    }

    // ==========================================
    // BULK STUDENT CREDENTIALS GENERATION
    // ==========================================

    async generateStudentCredentials(
        schoolId: string,
        dto: GenerateStudentCredsDto,
    ): Promise<{
        created: number;
        credentials: Array<{
            studentName: string;
            grade: string;
            parentEmail: string;
            parentPassword: string;
            studentId: string;
        }>;
    }> {
        const school = await this.findOne(schoolId);
        const availableLicenses = school.licenseCount - school.usedLicenses;

        if (availableLicenses < dto.count) {
            throw new ConflictException(
                `Not enough school licenses. Available: ${availableLicenses}, Requested: ${dto.count}`,
            );
        }

        const prefix = (dto.prefix || 'student').toLowerCase().trim();
        const ts = Date.now().toString().slice(-4);
        const credentialsList: Array<{
            studentName: string;
            grade: string;
            parentEmail: string;
            parentPassword: string;
            studentId: string;
        }> = [];

        for (let i = 1; i <= dto.count; i++) {
            const studentIndex = i;
            const studentName = `${dto.prefix ? dto.prefix.charAt(0).toUpperCase() + dto.prefix.slice(1) : 'Student'} ${studentIndex}`;
            const cleanPrefix = (dto.prefix || 'student').toLowerCase().replace(/[^a-z0-9]/g, '');
            const schoolDomainSlug = (school.domain || school.code).toLowerCase().replace(/[^a-z0-9]/g, '');
            const parentEmail = `${cleanPrefix}${studentIndex}${ts}@${schoolDomainSlug}.yene.et`;
            const password = `Yene${this.generatePassword().slice(0, 6)}!`;

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);

            const parent = this.userRepository.create({
                email: parentEmail,
                password: hashedPassword,
                firstName: 'Parent of',
                lastName: studentName,
                role: UserRole.PARENT,
                schoolId: schoolId,
            });

            const savedParent = await this.userRepository.save(parent);

            const student = this.childRepository.create({
                name: studentName,
                age: dto.age || 6,
                grade: dto.grade || GradeLevel.KG,
                currentLanguage: dto.currentLanguage || SupportedLanguage.AMHARIC,
                dailyTimeLimitMinutes: 30,
                schoolId: schoolId,
                parentId: savedParent.id,
            });

            const savedStudent: Child = await this.childRepository.save(student) as Child;

            credentialsList.push({
                studentName,
                grade: dto.grade || 'kg',
                parentEmail,
                parentPassword: password,
                studentId: savedStudent.id,
            });
        }

        school.usedLicenses += dto.count;
        await this.schoolRepository.save(school);

        return {
            created: dto.count,
            credentials: credentialsList,
        };
    }

    private generatePassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}
