import {
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Tweet } from './tweet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { UpdateTweetDTO } from './dto/update-tweet.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { Paginated } from 'src/common/pagination/pagination.interface';

@Injectable()
export class TweetService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashtagService: HashtagService,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getTweets(
    userId: number,
    pageQueryDto: PaginationQueryDto,
  ): Promise<Paginated<Tweet>> {
    // Find user with the given userid from user table
    let user = await this.userService.FindUserById(userId);

    // if (!user) {
    //   throw new NotFoundException(`User with userId ${userId} is not found`);
    // }

    return await this.paginationProvider.paginationQuery(
      pageQueryDto,
      this.tweetRepository,
      { user: { id: userId } },
    );
  }

  public async CreateTweet(creatTweetDto: CreateTweetDto) {
    // Find user with the given userid from user table
    let user = await this.userService.FindUserById(creatTweetDto.userId);

    // Fetch all the hastags based on hastag array
    let hashtags = await this.hashtagService.findHashtags(
      creatTweetDto.hashtags ?? [],
    );

    // Create a tweet
    let tweet = await this.tweetRepository.create({
      ...creatTweetDto,
      user: user!,
      hashtags: hashtags,
    });
    // Save the tweet
    return await this.tweetRepository.save(tweet);
  }

  public async updateTweet(updateTweetDto: UpdateTweetDTO) {
    // find all hashtags
    let hashtags = await this.hashtagService.findHashtags(
      updateTweetDto.hashtags ?? [],
    );

    // find the tweet by Id
    let tweet = await this.tweetRepository.findOneBy({ id: updateTweetDto.id });

    // update properties of the tweet
    if (!tweet) {
      throw new Error(`Tweet with ID ${updateTweetDto.id} not found`);
    }
    tweet.text = updateTweetDto.text ?? tweet.text;
    tweet.image = updateTweetDto.image ?? tweet.image;
    tweet.hashtags = hashtags;

    // save the tweet
    return await this.tweetRepository.save(tweet);
  }

  public async deleteTweet(id: number) {
    await this.tweetRepository.delete({
      id,
    });
    return { deleted: true, id };
  }
}
