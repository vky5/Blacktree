package utils

import "database/sql"

func ToNullString(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}
