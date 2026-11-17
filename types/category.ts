import { RowDataPacket } from "mysql2";

export interface CategoryRow extends RowDataPacket {
  tag: string;
}