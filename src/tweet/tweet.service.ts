import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Tweet } from './tweet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTweetDto } from './dto/create-tweet.dto';

@Injectable()
export class TweetService {
  constructor(
    private readonly userService: UsersService,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
  ) {}

  public async getTweets(userId: number) {
    return await this.tweetRepository.find({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }

  public async CreateTweet(creatTweetDto: CreateTweetDto) {
    // Find user with the given userid from user table
    let user = await this.userService.FindUserById(creatTweetDto.userId);
    // Create a tweet
    let tweet = await this.tweetRepository.create({
      ...creatTweetDto,
      user: user!,
    });
    // Save the tweet
    return await this.tweetRepository.save(tweet);
  }
}
