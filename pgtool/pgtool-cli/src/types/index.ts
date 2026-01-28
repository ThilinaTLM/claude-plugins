// Configuration types
export interface PgToolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  passwordEnv?: string;
  schema?: string;
}

// Error codes
export type ErrorCode =
  | "CONFIG_NOT_FOUND"
  | "CONFIG_INVALID"
  | "CONNECTION_FAILED"
  | "QUERY_FAILED"
  | "TABLE_NOT_FOUND"
  | "SCHEMA_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "TIMEOUT";

// Base response types
export interface SuccessResponse<T> {
  ok: true;
  data?: T;
}

export interface ErrorResponse {
  ok: false;
  error: string;
  code: ErrorCode;
  hint?: string;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

// Schema types
export interface SchemaInfo {
  name: string;
  owner: string;
}

export interface SchemasResult {
  schemas: SchemaInfo[];
}

// Table types
export interface TableInfo {
  name: string;
  schema: string;
  type: "table" | "view" | "materialized view" | "foreign table";
  owner: string;
  rowEstimate: number;
  sizeBytes: number | null;
  sizeHuman: string | null;
}

export interface TablesResult {
  schema: string;
  tables: TableInfo[];
}

// Column types
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyRef: ForeignKeyRef | null;
  comment: string | null;
}

export interface ForeignKeyRef {
  schema: string;
  table: string;
  column: string;
}

export interface DescribeResult {
  schema: string;
  table: string;
  columns: ColumnInfo[];
  rowEstimate: number;
  sizeHuman: string | null;
}

// Index types
export interface IndexInfo {
  name: string;
  unique: boolean;
  primary: boolean;
  columns: string[];
  type: string;
  size: string | null;
  definition: string;
}

export interface IndexesResult {
  schema: string;
  table: string;
  indexes: IndexInfo[];
}

// Constraint types
export interface ConstraintInfo {
  name: string;
  type: "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE" | "CHECK" | "EXCLUDE";
  columns: string[];
  definition: string;
  foreignTable?: string;
  foreignColumns?: string[];
}

export interface ConstraintsResult {
  schema: string;
  table: string;
  constraints: ConstraintInfo[];
}

// Relationship types
export interface RelationshipInfo {
  constraintName: string;
  fromSchema: string;
  fromTable: string;
  fromColumns: string[];
  toSchema: string;
  toTable: string;
  toColumns: string[];
}

export interface RelationshipsResult {
  relationships: RelationshipInfo[];
}

// Query types
export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  dataTypeID: number;
}
