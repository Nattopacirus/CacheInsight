#include <iostream>
#include <iomanip>
#include <vector>
#include <cmath>
#include <bitset>
#include <fstream>
#include <sstream>
#include <string>
using namespace std;

struct CacheBlock {
    int tag;
    bool valid;
};

// Function to calculate log2 of an integer
int log2_int(int n) {
    if (n <= 0 || (n & (n - 1)) != 0) {
        cout << "Error: Block size must be a power of 2!" << endl;
        exit(1);  // Terminate the program if block size is not a power of 2
    }
    return static_cast<int>(log2(n));
}

// Convert hexadecimal string to decimal integer
unsigned int hex_to_dec(const string& hex_str) {
    unsigned int result;
    stringstream ss;
    ss << hex << hex_str;
    ss >> result;
    return result;
}

// Print the cache status for direct-mapped cache
void print_direct_cache(const vector<CacheBlock>& cache, int num_blocks, int index, int tag, bool hit) {
    cout << "+-------+----------+----------+---------+\n";
    cout << "| Index |   Tag    | Hit/Miss | Valid   |\n";
    cout << "+-------+----------+----------+---------+\n";
    
    for (int i = 0; i < num_blocks; i++) {
        cout << "| " << setw(3) << i
             << "  | " << (cache[i].valid ? bitset<8>(cache[i].tag).to_string() : "        ")
             << "  | " << (i == index ? (hit ? "Hit" : "Miss") : "   ")
             << "  | " << (cache[i].valid ? "Valid" : "Invalid")
             << " |\n";
    }
    
    cout << "+-------+----------+----------+---------+\n\n";
}


// Print the cache status for fully-associative cache
void print_fully_associative_cache(const vector<CacheBlock>& cache, int num_blocks, int last_accessed, bool hit) {
    cout << "+-------+----------+----------+---------+\n";
    cout << "| Block |   Tag    | Hit/Miss | Valid   |\n";
    cout << "+-------+----------+----------+---------+\n";
    
    for (int i = 0; i < num_blocks; i++) {
        cout << "| " << setw(3) << i
             << "  | " << (cache[i].valid ? bitset<8>(cache[i].tag).to_string() : "        ")
             << "  | " << (i == last_accessed ? (hit ? "Hit" : "Miss") : "   ")
             << "  | " << (cache[i].valid ? "Valid" : "Invalid")
             << " |\n";
    }
    cout << "+-------+----------+----------+---------+\n\n";
}


// Print the cache status for set-associative cache
void print_set_associative_cache(const vector<vector<CacheBlock>>& cache, int sets, int blocks_per_set, int index, int tag, bool hit) {
    cout << "+-------+----------+----------+---------+\n";
    cout << "| Block |   Tag    | Hit/Miss | Valid   |\n";
    cout << "+-------+----------+----------+---------+\n";
    
    for (int i = 0; i < sets; i++) {
        for (int j = 0; j < blocks_per_set; j++) {
            cout << "| " << setw(3) << i
                 << "  | " << (cache[i][j].valid ? bitset<8>(cache[i][j].tag).to_string() : "        ")
                 << "  | " << ((i == index) ? (hit ? "Hit" : "Miss") : "   ")
                 << "  | " << (cache[i][j].valid ? "Valid" : "Invalid")
                 << " |\n";
        }
    }
    cout << "+-------+----------+----------+---------+\n\n";
}


// Simulate Direct-Mapped Cache
void Direct_map(int cache_size_kb, int block_size, const string addresses[], int num_addresses) {
    int cache_size_bytes = cache_size_kb * 1024;
    int num_blocks = cache_size_bytes / block_size;
    int offset_bits = log2_int(block_size);
    int index_bits = log2_int(num_blocks);

    vector<CacheBlock> cache(num_blocks, {0, false});
    int hits = 0, misses = 0;

    for (int i = 0; i < num_addresses; i++) {
        unsigned int address = hex_to_dec(addresses[i]);
        int index = (address >> offset_bits) & (num_blocks - 1);
        int tag = address >> (offset_bits + index_bits);

        // Extract offset from the address
        int offset = address & (block_size - 1);

        bool hit = cache[index].valid && cache[index].tag == tag;
        if (hit) {
            hits++;
        } else {
            misses++;
            cache[index] = {tag, true};
        }

        cout << "Address: " << hex << address << dec << " | Index: " << index 
             << " | Tag: " << tag << " | Offset: " << offset  // Print the offset
             << " | Hit/Miss: " << (hit ? "Hit" : "Miss") << endl;

        print_direct_cache(cache, num_blocks, index, tag, hit);
    }

    double hit_rate = (double)hits / (hits + misses) * 100;
    cout << "Total Hits: " << hits << " | Total Misses: " << misses << "\n";
    cout << "Hit Rate: " << fixed << setprecision(2) << hit_rate << "% | Miss Rate: " << (100 - hit_rate) << "%\n";
}


// Simulate Fully-Associative Cache
void Fully_associative(int cache_size_kb, int block_size, const string addresses[], int num_addresses) {
    int cache_size_bytes = cache_size_kb * 1024;
    int num_blocks = cache_size_bytes / block_size;
    int offset_bits = log2_int(block_size);

    vector<CacheBlock> cache(num_blocks, {0, false});
    int hits = 0, misses = 0;

    for (int i = 0; i < num_addresses; i++) {
        unsigned int address = hex_to_dec(addresses[i]);
        int tag = address >> offset_bits;

        // Extract offset from the address
        int offset = address & (block_size - 1);

        bool hit = false;
        int last_accessed = -1;
        for (int j = 0; j < num_blocks; j++) {
            if (cache[j].valid && cache[j].tag == tag) {
                hit = true;
                last_accessed = j;
                break;
            }
        }

        if (hit) {
            hits++;
        } else {
            misses++;
            last_accessed = misses % num_blocks;  // Round-robin replacement policy
            cache[last_accessed] = {tag, true};
        }

        cout << "Address: " << hex << address << dec << " | Tag: " << tag
             << " | Offset: " << offset  // Print the offset
             << " | Hit/Miss: " << (hit ? "Hit" : "Miss") << endl;

        print_fully_associative_cache(cache, num_blocks, last_accessed, hit);
    }

    double hit_rate = (double)hits / (hits + misses) * 100;
    cout << "Total Hits: " << hits << " | Total Misses: " << misses << "\n";
    cout << "Hit Rate: " << fixed << setprecision(2) << hit_rate << "% | Miss Rate: " << (100 - hit_rate) << "%\n";
}


// Simulate Set-Associative Cache
void Set_associative(int cache_size_kb, int block_size, int sets, const string addresses[], int num_addresses) {
    int cache_size_bytes = cache_size_kb * 1024;
    int blocks_per_set = cache_size_bytes / block_size / sets;
    int offset_bits = log2_int(block_size);
    int index_bits = log2_int(sets);

    vector<vector<CacheBlock>> cache(sets, vector<CacheBlock>(blocks_per_set, {0, false}));
    int hits = 0, misses = 0;

    for (int i = 0; i < num_addresses; i++) {
        unsigned int address = hex_to_dec(addresses[i]);
        int index = (address >> offset_bits) & (sets - 1);
        int tag = address >> (offset_bits + index_bits);

        // Extract offset from the address
        int offset = address & (block_size - 1);

        bool hit = false;
        int block_idx = -1;
        for (int j = 0; j < blocks_per_set; j++) {
            if (cache[index][j].valid && cache[index][j].tag == tag) {
                hit = true;
                block_idx = j;
                break;
            }
        }

        if (hit) {
            hits++;
        } else {
            misses++;
            block_idx = misses % blocks_per_set; // Simple round-robin replacement
            cache[index][block_idx] = {tag, true};
        }

        cout << "Address: " << hex << address << dec << " | Index: " << index 
             << " | Tag: " << tag << " | Offset: " << offset  // Print the offset
             << " | Hit/Miss: " << (hit ? "Hit" : "Miss") << endl;

        print_set_associative_cache(cache, sets, blocks_per_set, index, tag, hit);
    }

    double hit_rate = (double)hits / (hits + misses) * 100;
    cout << "Total Hits: " << hits << " | Total Misses: " << misses << "\n";
    cout << "Hit Rate: " << fixed << setprecision(2) << hit_rate << "% | Miss Rate: " << (100 - hit_rate) << "%\n";
}


// Main function for user input and cache simulation
int main() {
    ifstream file("sample3.csv");
    string addresses[1000]; //รองรับได้สูงสุด 1000 ที่อยู่
    string line;
    int count = 0;

    getline(file, line); // ข้าม header
    while (getline(file, line) && count < 1000) {
        if (!line.empty()) {
            addresses[count++] = line;
        }
    }
    file.close();

    while (true) {
        int choice;
        cout << "======================\n"
             << "1) Direct map\n"
             << "2) Fully associative\n"
             << "3) Set-Associative\n"
             << "4) Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 4) break;

        switch (choice) {
            case 1:
                int cache_size, block_size;
                cout << "Cache Size (KB): ";
                cin >> cache_size;
                cout << "Block Size (Bytes): ";
                cin >> block_size;
                Direct_map(cache_size, block_size, addresses, count);
                break;
            case 2:
                cout << "Cache Size (KB): ";
                cin >> cache_size;
                cout << "Block Size (Bytes): ";
                cin >> block_size;
                Fully_associative(cache_size, block_size, addresses, count);
                break;
            case 3:
                int sets;
                cout << "Cache Size (KB): ";
                cin >> cache_size;
                cout << "Block Size (Bytes): ";
                cin >> block_size;
                cout << "Sets: ";
                cin >> sets;
                Set_associative(cache_size, block_size, sets, addresses, count);
                break;
            default:
                cout << "Invalid choice, using default cache strategy.\n";
                break;
        }
    }

    return 0;
}
