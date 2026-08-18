import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { StudentExperienceService } from './student-experience.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentExperienceController {
  constructor(private readonly studentService: StudentExperienceService) {}

  @Get('roadmap/:childId')
  getRoadmap(@Param('childId') childId: string) {
    return this.studentService.getRoadmapForChild(childId);
  }

  @Get('avatar/shop')
  getAvatarShop() {
    return this.studentService.getAvatarShopItems();
  }

  @Post('avatar/equip')
  equipItem(@Body() body: { childId: string; itemId: string }) {
    return this.studentService.equipAvatarItem(body.childId, body.itemId);
  }

  @Post('node/complete')
  completeNode(
    @Body() body: { childId: string; chapterId: string; nodeId: string; starsEarned: number },
  ) {
    return this.studentService.completeNode(
      body.childId,
      body.chapterId,
      body.nodeId,
      body.starsEarned || 10,
    );
  }
}
