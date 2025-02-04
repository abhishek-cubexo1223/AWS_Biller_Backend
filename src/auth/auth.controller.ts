import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserDto } from './dto/user.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { ForgetPasswordDto } from './dto/forgetpassword.dto';
import { PartialType } from '@nestjs/mapped-types';




@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.authService.login(loginDto);
    const userDto = new UserDto();
    userDto.email = user.email;
    userDto.password = user.password;
    userDto.address = user.address;
    userDto.companyName = user.companyName;
    userDto.gistin = user.gistin;
    userDto.pancardNo = user.pancardNo;
    userDto.invoiceNo = user.invoiceNo;
    userDto.contactNo = user.contactNo;
    userDto.companyLogo = user.companyLogo;
    userDto.accountNo = user.accountNo;
    userDto.bank = user.bank;
    userDto.ifsc = user.ifsc;
    return { token, userDto };
  }
  @Post('/generate')
  async generateOtp(@Body() forgetPassword: ForgetPasswordDto) {
    return this.authService.generateOtp(forgetPassword);
  }
  @Post('/verify')
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyDto.email, verifyDto.otp);
  }
  @Patch('/resetPassword')
  async setPassword(@Body() forgetPassword: LoginDto) {
    return this.authService.addNewPass(forgetPassword);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.authService.getUserById(id);
    const userDto = new UserDto();
    userDto.email = user.email;
    userDto.password = user.password;
    userDto.address = user.address;
    userDto.companyName = user.companyName;
    userDto.gistin = user.gistin;
    userDto.pancardNo = user.pancardNo;
    userDto.invoiceNo = user.invoiceNo;
    userDto.contactNo = user.contactNo;
    userDto.companyLogo = user.companyLogo;
    userDto.accountNo = user.accountNo;
    userDto.bank = user.bank;
    userDto.ifsc = user.ifsc;
    return userDto;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/update/:id')
  async updateUserById(@Param('id') id: string, @Body() updateData: Partial<UserDto>) {
    const updatedUser = await this.authService.updateUserById(id, updateData);
    const userDto = new UserDto();
    userDto.email = updatedUser.email;
    userDto.password = updatedUser.password;
    userDto.address = updatedUser.address;
    userDto.companyName = updatedUser.companyName;
    userDto.gistin = updatedUser.gistin;
    userDto.pancardNo = updatedUser.pancardNo;
    userDto.invoiceNo = updatedUser.invoiceNo;
    userDto.contactNo = updatedUser.contactNo;
    userDto.companyLogo = updatedUser.companyLogo;
    userDto.accountNo = updatedUser.accountNo;
    userDto.bank = updatedUser.bank;
    userDto.ifsc = updatedUser.ifsc;
    return userDto;
  }

}
