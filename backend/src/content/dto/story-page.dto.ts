import { StoryPage } from '../../entities/story.entity';

export class StoryPageResponseDto {
    storyId: string;
    title: string;
    pageNumber: number;
    totalPages: number;
    page: StoryPage;
}
