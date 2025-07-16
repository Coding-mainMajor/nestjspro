import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDTO } from './dto/update-tweet.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

@Controller('tweet')
export class TweetController {
  constructor(private tweetService: TweetService) {}

  // http://localhost:3000/tweet/101?limit=10&page=3
  @Get(':userid')
  public GetTweets(
    @Param('userid', ParseIntPipe) userid: number,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    console.log(paginationQueryDto);
    return this.tweetService.getTweets(userid, paginationQueryDto);
  }

  @Post()
  public CreateTweet(@Body() tweet: CreateTweetDto) {
    return this.tweetService.CreateTweet(tweet);
  }

  @Patch()
  public UpdateTweet(@Body() tweet: UpdateTweetDTO) {
    this.tweetService.updateTweet(tweet);
  }

  // Delete http:localhost:3000/tweet/7
  @Delete(':id')
  public DeleteTweet(@Param('id', ParseIntPipe) id: number) {
    return this.tweetService.deleteTweet(id);
  }
}
