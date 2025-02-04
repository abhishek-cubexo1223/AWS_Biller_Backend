import { Injectable, NotFoundException ,BadRequestException,InternalServerErrorException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice } from './schemas/invoice';
import { Model, Types } from 'mongoose';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { User } from 'src/auth/schemas/user';
import { Project } from 'src/projects/schemas/project';
import { Client } from 'src/client/schemas/clients';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    try {
      // Step 1: Populate the client and user details
      const client = await this.clientModel.findById(createInvoiceDto.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
  
      const user = await this.userModel.findById(createInvoiceDto.adminId);
      if (!user) {
        throw new Error('User not found');
      }
  
      // Step 2: Create the invoice
      const invoiceData = {
        ...createInvoiceDto,
        clientDetails: {
          clientName: client.clientName,
          contactNo:client.contactNo,
          gistin: client.gistin,
          pancardNo: client.pancardNo,
          address: client.address,
          email: client.email,
        },
        adminDetails: {
          email: user.email,
          companyName: user.companyName,
          gistin: user.gistin,
          contactNo: user.contactNo,
          pancardNo: user.pancardNo,
          address: user.address,
          companyLogo: user.companyLogo,
          accountNo: user.accountNo,
          ifsc: user.ifsc,
          bank: user.bank,
        },
      };
  
      const invoice = await this.invoiceModel.create(invoiceData);
  
      // Step 3: Update the invoice number for the user
      user.invoiceNo = (user.invoiceNo || 0) + 1;
      await user.save();
  
      return invoice;
    } catch (error) {
      console.error('Error in creating invoice:', error);
      throw new Error('Error in creating invoice');
    }
  }
  
  async getAllInvoices(user: User) {
    try {
      const invoices = await this.invoiceModel.find({ adminId: user._id });
      return invoices;
    } catch (error) {
      return error;
    }
  }
  async getInvoiceById(id: string) {
    try {
      return await this.invoiceModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Invoice does not exists');
    }
  }

  async updateInvoice(id: string, updateInvoiceDto: Partial<CreateInvoiceDto>) {
    try {
      const invoice = await this.invoiceModel.findById(id);

      if (!invoice) {
        throw new NotFoundException('Invoice does not exist');
      }

      // Update the invoice fields
      Object.assign(invoice, updateInvoiceDto);

      await invoice.save();
      return invoice;
    } catch (error) {
      console.error('Error details:', error.message || error);
      throw new Error('Error updating invoice');
    }
  }



  async getInvoiceCountByYear(year: string, userId: string) {
    try {
      const counts = await this.invoiceModel.aggregate([
        {
          $match: {
            adminId: new Types.ObjectId(userId),
            billDate: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$billDate' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            count: 1
          }
        },
        { $sort: { '_id': 1 } },
      ]);

      const monthlyCounts = Array(12).fill(0);

      counts.forEach(({ _id, count }) => {
        monthlyCounts[_id - 1] = count;
      });

      return { year: year, data: counts };
    } catch (error) {
      throw new NotFoundException('Unable to get invoice counts for the specified year.');
    }
  }


  async getInvoicesByYearAndMonth(year: string, month: string, userId: string) {
    const formattedMonth = month.toString().padStart(2, '0');
    const startDate = new Date(`${year}-${formattedMonth}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date range generated.');
    }
  
    const invoices = await this.invoiceModel
      .find({ billDate: { $gte: startDate, $lt: endDate } })
      .exec();
  
      if (!invoices || invoices.length === 0) {
        return []; 
      }
  
    return invoices;
  }
  
  async getInvoicesByDateRange(
    fromYear: string,
    fromMonth: string,
    toYear: string,
    toMonth: string,
    userId: string,
  ) {
    const formattedFromMonth = fromMonth.toString().padStart(2, '0');
    const formattedToMonth = toMonth.toString().padStart(2, '0');
  
    const fromDate = new Date(`${fromYear}-${formattedFromMonth}-01T00:00:00Z`);
    const toDate = new Date(`${toYear}-${formattedToMonth}-01T00:00:00Z`);
    toDate.setMonth(toDate.getMonth() + 1); // Move to the start of the next month

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date range provided.');
    } 

    try {
      const invoices = await this.invoiceModel
        .find({
          adminId: new Types.ObjectId(userId),
          billDate: { $gte: fromDate, $lt: toDate },
        })
        .exec();

      if (!invoices || invoices.length === 0) {
        return []; 
      }

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices by date range:', error);
      throw new InternalServerErrorException('Failed to fetch invoices by date range.');
    }
  }
  
  
}