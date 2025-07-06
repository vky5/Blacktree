package utils

import (
	"database/sql"
	"strconv"
	"strings"
	"log"
)

func ToNullInt(s string) sql.NullInt64 {
	s = strings.TrimSpace(s)
	if s == "" {
		log.Printf("⚠️ Empty port string")
		return sql.NullInt64{Valid: false}
	}

	i, err := strconv.Atoi(s)
	if err != nil {
		log.Printf("⚠️ Invalid port string: %s", s)
		return sql.NullInt64{Valid: false}
	}
	log.Printf("✅ Converted port string '%s' -> %d", s, i)
	return sql.NullInt64{Int64: int64(i), Valid: true}
}
