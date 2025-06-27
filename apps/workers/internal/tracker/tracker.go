package tracker

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var mu sync.Mutex // Mutex to ensure thread safety (safe concurrent access to file)

const trackerFilePath = "./repos.json" // the location of the tracker file

type RepoEntry struct {
	Path      string `json:"path"`      // JSON tag: field becomes "path" in JSON (not "Path")
	Repo      string `json:"repo"`      // used to store the repo name
	Status    string `json:"status"`    // e.g. "cloned", "built"
	CreatedAt int64  `json:"createdAt"` // Unix timestamp for sorting/cleanup
}

// SaveEntry adds a new entry to the tracker file
func SaveEntry(entry RepoEntry) error {
	mu.Lock()             // Ensure thread safety
	defer mu.Unlock()     // Unlock after saving

	entries, _ := LoadAllEntries() // Load existing entries (ignore error intentionally)

	entries = append(entries, entry) // Append new entry

	if err := ensureTrackerDir(); err != nil {
		return fmt.Errorf("failed to ensure tracker directory: %w", err)
	}

	fmt.Printf("📦 Saving entry for repo: %s at %s\n", entry.Repo, entry.Path)

	file, err := os.Create(trackerFilePath) // Overwrites existing file or creates new


	if err != nil {
		return fmt.Errorf("failed to create tracker file: %w", err)
	}
	defer file.Close()

	enc := json.NewEncoder(file)  // Encoder writes JSON to file
	enc.SetIndent("", "  ")       // Pretty print JSON for readability
	return enc.Encode(entries)    // Serialize all entries back to file
}

// LoadAllEntries reads all tracked repo entries 
func LoadAllEntries() ([]RepoEntry, error) {
	file, err := os.Open(trackerFilePath) // Open file for reading
	if err != nil {
		if os.IsNotExist(err) {
			return []RepoEntry{}, nil // Return empty slice if file doesn't exist yet
		}
		return nil, fmt.Errorf("failed to open tracker file: %w", err)
	}
	defer file.Close()

	var entries []RepoEntry
	if err := json.NewDecoder(file).Decode(&entries); err != nil {
		return nil, fmt.Errorf("failed to decode tracker file: %w", err)
	}
	return entries, nil
}

// MarkAsBuilt updates the status of a repo entry to "built"
func MarkAsBuilt(repoPath string) error {
	mu.Lock()         // Ensure thread safety
	defer mu.Unlock() // Unlock after updating

	entries, err := LoadAllEntries()
	if err != nil {
		return fmt.Errorf("failed to load entries: %w", err)
	}

	updated := false

	for i, entry := range entries {
		if entry.Path == repoPath {
			entries[i].Status = "built"
			entries[i].CreatedAt = time.Now().Unix() // Update timestamp
			updated = true
			break
		}
	}

	if !updated {
		return fmt.Errorf("repo not found in tracker: %s", repoPath)
	}

	// Write updated entries back to the tracker file
	file, err := os.Create(trackerFilePath) // Rewrites full list (safe since file is small)
	if err != nil {
		return fmt.Errorf("failed to create tracker file: %w", err)
	}
	defer file.Close()

	enc := json.NewEncoder(file)
	enc.SetIndent("", "  ") // Pretty print JSON
	return enc.Encode(entries)
}

// ensureTrackerDir creates the directory for the tracker file if it doesn't exist
func ensureTrackerDir() error {
	dir := filepath.Dir(trackerFilePath)    // Get directory path from full file path
	return os.MkdirAll(dir, 0755)           // Create dir and parents if missing
}
