import { PartialType } from "@nestjs/swagger";
import { CreateFactoryPostDto } from "./create-factory-post.dto";

export class UpdateFactoryPostDto extends PartialType(CreateFactoryPostDto) {}
