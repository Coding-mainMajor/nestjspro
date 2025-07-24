import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
  RequestTimeoutException,
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
import { ActiveUserType } from 'src/auth/interfaces/active-user-type.interface';
import { User } from 'src/users/user.entity';
import { Hashtag } from 'src/hashtag/hashtag.entity';

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

  public async CreateTweet(createTweetDto: CreateTweetDto, userId: number) {
    let user: User;
    let hashtags: Hashtag[] = [];
    try {
      // Find user with the given userid from user table
      user = await this.userService.FindUserById(userId);

      // Fetch all the hastags based on hastag array
      // if (creatTweetDto.hashtags) {
      //   hashtags = await this.hashtagService.findHashtags(
      //     creatTweetDto.hashtags ?? [],
      //   );
      // }

      if (createTweetDto.hashtags?.length) {
        hashtags = await this.hashtagService.findHashtags(
          createTweetDto.hashtags,
        );
        console.log(hashtags.length, createTweetDto.hashtags.length);
        if (hashtags.length !== createTweetDto.hashtags.length) {
          throw new BadRequestException(
            'Some provided hashtags were not found.',
          );
        }
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new RequestTimeoutException('Failed to validate user or hashtags.');
    }

    // Create a tweet
    // let tweet = this.tweetRepository.create({
    //   ...creatTweetDto,
    //   user,
    //   hashtags,
    // });
    // try {
    //   // Save the tweet
    //   return await this.tweetRepository.save(tweet);
    // } catch (error) {
    //   throw new ConflictException(error);
    // }

    const tweet = this.tweetRepository.create({
      ...createTweetDto,
      user,
      hashtags,
    });

    try {
      return await this.tweetRepository.save(tweet);
    } catch (error) {
      throw new ConflictException('Failed to save tweet.');
    }
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
