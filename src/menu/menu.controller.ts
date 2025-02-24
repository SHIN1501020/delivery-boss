import { Body, Controller, Delete, Get, Param, ParseFilePipeBuilder, Post, Put, Req, UploadedFile, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Menu } from '@prisma/client';
import { AuthEntity } from 'src/auth/entity/auth.entity';
import { ownerAuthGuard } from 'src/auth/owner.jwt-auth.guard';
import { ApiFile } from 'src/utils/decorator/api-file.decorator';
import { CustomRequest } from 'types/express.type';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';


// interface RequestWithUser extends Request {
//   user: Owner;
// }

//Todo: 중복되는 코드 정리
@Controller('/stores/:storeId/menus')
@ApiTags('menu CRUD')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(ownerAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthEntity })
  @ApiOperation({ summary: '메뉴 생성' })
  @ApiParam({
    name: 'storeId',
    type: 'number',
  })
  @ApiFile('file')
  @Post('/')
  @UsePipes(ValidationPipe)
  createMenu(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      })
    )
    file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Param('storeId') storeId: number,
    @Body() data: CreateMenuDto
  ): Promise<Menu> {
    
    const user: number = req.user.id;

    data = { StoreId: storeId, ...data, image: file.path };

    return this.menuService.createMenu(data, user);
  }

  @ApiOperation({ summary: '메뉴 전체 조회' })
  @ApiParam({
    name: 'storeId',
    type: 'number',
  })
  @Get('/')
  getMeuns(@Param('storeId') storeId: number) {
    return this.menuService.getMenus({ StoreId: storeId });
  }


  // @ApiOperation({ summary: '특정 메뉴 조회'})
  // @ApiParam({
  //   name: 'storeId',
  //   type: 'number',
  // })
  // @ApiParam({
  //   name: 'menuId',
  //   type: 'number',
  // })
  @ApiExcludeEndpoint()
  @Get('/:menuId')
  getMenu(@Param() params: { storeId: number; menuId: number }) {
    return this.menuService.getMenu({ id: Number(params.menuId), StoreId: Number(params.storeId) });
  }

  @UseGuards(ownerAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthEntity })
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiParam({
    name: 'storeId',
    type: 'number',
  })
  @ApiParam({
    name: 'menuId',
    type: 'number',
  })
  @ApiFile('file')
  @Put('/:menuId') //* params DTO
  @UsePipes(ValidationPipe)
  updateMenu(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: false,
      })
    )
    file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Param() params: { storeId: number; menuId: number },
    @Body() data: UpdateMenuDto
  ) {

    const user: number = req.user.id;

    data = { StoreId: Number(params.storeId), menuId: Number(params.menuId), ...data, image: file.path };

    return this.menuService.updateMenu(data, user);
  }

  @UseGuards(ownerAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthEntity })
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiParam({
    name: 'storeId',
    type: 'number',
  })
  @ApiParam({
    name: 'menuId',
    type: 'number',
  })
  @Delete('/:menuId')
  deleteMenu(@Req() req: CustomRequest, @Param() params: { storeId: number; menuId: number }) {

    const user: number = req.user.id;

    return this.menuService.deleteMenu({ id: Number(params.menuId), StoreId: Number(params.storeId) }, user);
  }
}
