import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Store } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { FindStoreDto } from './dto/find-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

// TODO 생성 및 업데이트 날짜 추가
// TODO 정렬 기능 추가 -> 날짜순 or 좋아요 순 등
@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  // 업장 정보 생성
  async createStore(ownerId: number, createStoreDto: CreateStoreDto): Promise<{ message: string }> {
    // OwnerId가 5 이상일 떄 에러남 => 등록된 OwnerId가 4까지라서 에러 났음
    // TODO: OwnerId 정보를 담을 방법 정해서 코드 수정, (지금은 body에서 직접 입력, Owner : Store = 1 : 1)
    // ? findFirst -> findUnique 바꾸면 where 에서 에러남(where 밑에 빨간 줄)
    // ? -> OwnerIdr가 unique 값이 아니라 그렇당 코드를 의심하지 말고 항상 나를 의심해보쟈!! ><
    // 프리즈마에서 초기 1:1 유니크 연결인데 1:n 관계로 설정해둬서 문제가 생김

    const store: Store = await this.prisma.store.findUnique({ where: { OwnerId: ownerId } });
    if (store) {
      throw new HttpException('이미 가게가 등록되어 있습니다.', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.store.create({
      data: {
        OwnerId: ownerId,
        name: createStoreDto.name,
        info: createStoreDto.info,
      },
    });

    return { message: '업장 정보 생성이 완료되었습니다.' };
  }

  // 전체 업장 조회 (메인페이지로 연결)
  async findAllStores(): Promise<FindStoreDto[]> {
    return this.prisma.store.findMany({ select: { OwnerId: true, name: true, info: true } });
  }

  // 업장 세부 조회
  async findOneStore(storeId: number): Promise<FindStoreDto> {
    return this.prisma.store.findUnique({ where: { id: storeId }, select: { OwnerId: true, name: true, info: true } });
  }

  // 업장 정보 수정
  // TODO 로그인 정보로 수정 권한 추가
  async updateStore(ownerId: number, storeId: number, updateStoreDto: UpdateStoreDto): Promise<{ message: string }> {
    // ? 여기는 return 왜 안붙여도 되는지 궁금하당
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      throw new HttpException('업장 정보가 존재하지 않습니다.', HttpStatus.NOT_FOUND);
    }

    if (store.OwnerId !== ownerId) {
      throw new HttpException('수정 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    await this.prisma.store.update({ where: { id: storeId }, data: updateStoreDto });

    return { message: '업장 정보 수정이 완료되었니다.' };
  }

  // 업장 삭제
  // TODO 로그인 정보로 삭제 권한 추가
  // delete 완료 후 에러 메시지 작성
  async deleteStore(ownerId, storeId: number): Promise<{ message: string }> {
    const store: Store = await this.prisma.store.findUnique({ where: { id: storeId } });

    if (!store) {
      throw new HttpException('업장 정보가 존재하지 않습니다.', HttpStatus.NOT_FOUND);
    }

    if (store.OwnerId !== ownerId) {
      throw new HttpException('삭제 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    await this.prisma.store.delete({ where: { id: storeId } });

    return { message: '업장 정보 삭제가 완료되었습니다.' };
  }
}
