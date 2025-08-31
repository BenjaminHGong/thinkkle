from collections import defaultdict
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from itertools import permutations
import time

app = Flask(__name__, static_folder='../docs', static_url_path='')
CORS(app)


@app.route('/api/board', methods=['POST'])
def receive_board():
    data = request.get_json()
    board = data['board']
    rack = data.get('rack', [])
    special_squares = data.get('specialSquares', [])
    moves = get_moves(board, rack, special_squares)  
    return jsonify({'status': 'received', 'board_shape': [len(board), len(board[0])], 'rack': rack, 'moves': moves})

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

def get_moves(board, rack, special_squares=[]):
    anchors = find_anchors(board)
    results = []
    for anchor in anchors:
        results += get_horizontal_words_from_anchor(board, anchor, rack, dictionary)
        results += get_vertical_words_from_anchor(board, anchor, rack, dictionary)
    
    valid_moves = []
    first_turn = all(cell == '' for row in board for cell in row)
    for move in results:
        
        
        word = move['word']
        row, col = move['row'], move['col']
        direction = move['direction']
        tiles = []
        for idx, (r, c) in enumerate(move['rack_positions']):
            
            if direction == 'horizontal':
                letter = word[c - col]
            else:
                letter = word[r - row]
            tiles.append((r, c, letter))
        
        valid, msg = is_valid_placement(board, tiles, dictionary, first_turn=first_turn)
        if valid:
            move['validation_message'] = msg
            
            
            
            word_tiles = []
            if direction == 'horizontal':
                for i, letter in enumerate(word):
                    word_tiles.append((row, col + i, letter))
            else:
                for i, letter in enumerate(word):
                    word_tiles.append((row + i, col, letter))
            
            newly_placed_set = set(move['rack_positions'])
            move['score'] = calculate_word_score(word_tiles, letter_scores, special_squares or [], newly_placed_set)
            valid_moves.append(move)
    
    valid_moves.sort(key=lambda m: m['score'], reverse=True)
    if valid_moves:
        print(valid_moves[0])
    return valid_moves[0] if valid_moves else {'validation_message': 'No valid moves found.'}

letter_scores = {
    'A': 1, 
    'B': 4, 
    'C': 2, 
    'D': 2, 
    'E': 1,
    'F': 6,
    'G': 2,
    'H': 4,
    'I': 1,
    'J': 10,
    'K': 6,
    'L': 1,
    'M': 2,
    'N': 1,
    'O': 1,
    'P': 2,
    'Q': 10,
    'R': 1,
    'S': 1,
    'T': 1,
    'U': 2,
    'V': 6,
    'W': 6,
    'X': 10,
    'Y': 4,
    'Z': 8
}


class Trie:
    __slots__ = ("map", "end")
    def __init__(self) -> None:
        self.map = defaultdict(Trie)
        self.end = False
        
    def insert(self, word:str) -> None:
        node = self
        for letter in word.strip():
            node = node.map[letter]
        node.end = True
        
    def contains(self, word:str, is_word:bool=True) -> bool:
        node = self
        for letter in word:
            if letter not in node.map:
                return False
            else:
                node = node.map[letter]
        return node.end if is_word else node
    
    def display(self, level=0, prefix="") -> None:
        print("  " * level + f"{prefix}")
        for letter, next_node in self.map.items():
            next_node.display(level + 1, letter)
            
    def get_words(self, letters: list, infix: str="") -> list:
        words = set()

        def explore(node, current_word, remaining_letters, infix_index):
            nonlocal words
            if remaining_letters:
                for letter, next_node in node.map.items():
                    
                    if letter in remaining_letters:
                        new_rack = remaining_letters.copy()
                        new_rack.remove(letter)
                        if next_node.end:
                            words.add((current_word + letter, infix_index))
                        explore(next_node, current_word + letter, new_rack, infix_index)
        
        def get_prefixes():
            for r in range(len(letters) + 1):
                combinations = permutations(letters, r)
                for prefix in combinations:
                    prefix = list(prefix)
                    if "#" in prefix:
                        blank_indices = [i for i in range(len(prefix)) if prefix[i] == "#"]
                        blank_letter_combinations = permutations(set("ABCDEFGHIJKLMNOPQRSTUVWYZ"), prefix.count("#"))
                        for blank_letter_tuple in blank_letter_combinations:
                            temp = prefix.copy()
                            for i, idx in enumerate(blank_indices): temp[idx] = blank_letter_tuple[i]
                            yield (prefix, "".join(temp) + infix)
                            
                    else:
                        yield (prefix, "".join(prefix) + infix)
                        
        for prefix, term in get_prefixes():
            suffixes = self.contains(term, False)
            if suffixes:
                remaining_letters = [letter for letter in letters if letter != "#"]
                for letter in prefix:
                    if letter in set(remaining_letters): remaining_letters.remove(letter)
                explore(suffixes, term, remaining_letters, len(prefix))
        
        return list(words)
    
    def get_words_with_pattern(self, rack, pattern):
        """
        rack: list of available letters (e.g., ['A','B','C','D','E','F','G'])
        pattern: string, e.g. 'C??P?'
        Returns: list of words from the Trie that fit the pattern and use only rack letters for '?'
        """
        results = set()
        rack = list(rack)  

        def dfs(node, idx, current, used):
            if idx == len(pattern):
                if node.end:
                    results.add(''.join(current))
                return
            char = pattern[idx]
            if char == '?':
                used_letters = set()
                for i, letter in enumerate(rack):
                    if i in used or letter in used_letters:
                        continue
                    used_letters.add(letter)
                    if letter in node.map:
                        current.append(letter)
                        dfs(node.map[letter], idx+1, current, used | {i})
                        current.pop()
            else:
                if char in node.map:
                    current.append(char)
                    dfs(node.map[char], idx+1, current, used)
                    current.pop()

        dfs(self, 0, [], set())
        return list(results)
    
def find_anchors(board):
    anchors = set()
    rows, cols = len(board), len(board[0])
    board_empty = all(cell == '' for row in board for cell in row)
    if board_empty:
        
        anchors.add((rows // 2, cols // 2))
        return anchors
    for r in range(len(board)):
        for c in range(len(board[0])):
            if board[r][c] == '':
                
                for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                    nr, nc = r+dr, c+dc
                    if 0 <= nr < len(board) and 0 <= nc < len(board[0]):
                        if board[nr][nc] != '':
                            anchors.add((r, c))
    return anchors

def has_adjacent_horizontal(row, c):
    n = len(row)
    return (c > 0 and row[c-1] != '') or (c < n-1 and row[c+1] != '')

def get_horizontal_words_from_anchor(board, anchor, rack, dictionary):
    r, c = anchor
    row = board[r]
    n = len(row)
    results = []
    
    if not has_adjacent_horizontal(row, c):
        
        for length in range(2, min(len(rack)+2, n+1)):  
            for offset in range(length):
                start = c - offset
                end = start + length
                if start < 0 or end > n:
                    continue
                pattern = '?' * length
                if 0 <= c - start < length:
                    found_words = dictionary.get_words_with_pattern(rack, pattern)
                    for word in found_words:
                        rack_positions = [(r, start + idx) for idx in range(length)]
                        results.append({
                            'word': word,
                            'row': r,
                            'col': start,
                            'direction': 'horizontal',
                            'rack_positions': rack_positions
                        })
        return results

    
    left = c
    while left > 0 and row[left - 1] != '':
        left -= 1
    
    right = c
    while right < n - 1 and row[right + 1] != '':
        right += 1

    
    
    min_left = left
    max_right = right
    for window_left in range(max(0, min_left - 7), left + 1):  
        for window_right in range(right, min(n - 1, max_right + 7) + 1):  
            if not (window_left <= c <= window_right):
                continue  
            pattern = ''
            for i in range(window_left, window_right + 1):
                if row[i] == '':
                    pattern += '?'
                else:
                    pattern += row[i]
            
            if '?' not in pattern:
                continue
            found_words = dictionary.get_words_with_pattern(rack, pattern)
            for word in found_words:
                rack_positions = []
                for idx, (p, w) in enumerate(zip(pattern, word)):
                    if p == '?':
                        rack_positions.append(window_left + idx)
                results.append({
                    'word': word,
                    'row': r,
                    'col': window_left,
                    'direction': 'horizontal',
                    'rack_positions': [(r, window_left + idx) for idx, (p, w) in enumerate(zip(pattern, word)) if p == '?']
                })

    return results

def has_adjacent_vertical(board, r, c):
    rows = len(board)
    return (r > 0 and board[r-1][c] != '') or (r < rows-1 and board[r+1][c] != '')

def get_vertical_words_from_anchor(board, anchor, rack, dictionary):
    r, c = anchor
    rows = len(board)
    results = []

    col = [board[row][c] for row in range(rows)]
    up = r
    while up > 0 and col[up - 1] != '':
        up -= 1
    down = r
    while down < rows - 1 and col[down + 1] != '':
        down += 1
        
    if not has_adjacent_vertical(board, r, c):
        for length in range(2, min(len(rack)+2, rows+1)):  
            for offset in range(length):
                start = r - offset
                end = start + length
                if start < 0 or end > rows:
                    continue
                pattern = '?' * length
                if 0 <= r - start < length:
                    found_words = dictionary.get_words_with_pattern(rack, pattern)
                    for word in found_words:
                        rack_positions = [(start + idx, c) for idx in range(length)]
                        results.append({
                            'word': word,
                            'row': start,
                            'col': c,
                            'direction': 'vertical',
                            'rack_positions': rack_positions
                        })
        return results

    min_up = up
    max_down = down
    for window_up in range(max(0, min_up - 7), up + 1):  
        for window_down in range(down, min(rows - 1, max_down + 7) + 1):  
            if not (window_up <= r <= window_down):
                continue
            pattern = ''
            for i in range(window_up, window_down + 1):
                if col[i] == '':
                    pattern += '?'
                else:
                    pattern += col[i]
            if '?' not in pattern:
                continue
            found_words = dictionary.get_words_with_pattern(rack, pattern)
            for word in found_words:
                rack_positions = []
                for idx, (p, w) in enumerate(zip(pattern, word)):
                    if p == '?':
                        rack_positions.append(window_up + idx)
                results.append({
                    'word': word,
                    'row': window_up,
                    'col': c,
                    'direction': 'vertical',
                    'rack_positions': [(window_up + idx, c) for idx, (p, w) in enumerate(zip(pattern, word)) if p == '?']
                })

    return results

def calculate_word_score(word_tiles, letter_scores, special_squares, newly_placed_set=None):
    """
    word_tiles: list of (row, col, letter)
    letter_scores: dict mapping letter to score
    special_squares: list of {'row': int, 'col': int, 'type': str}
    newly_placed_set: set of (row, col) tuples that are newly placed (optional)
    """
    score = 0
    word_multiplier = 1
    
    special_lookup = {(sq['row'], sq['col']): sq['type'] for sq in special_squares}
    if newly_placed_set is None:
        newly_placed_set = set((row, col) for row, col, _ in word_tiles)

    for row, col, letter in word_tiles:
        letter_score = letter_scores.get(letter.upper(), 0)
        letter_multiplier = 1
        square_type = special_lookup.get((row, col), None)
        is_new = (row, col) in newly_placed_set

        if is_new and square_type:
            if square_type == 'double-letter':
                letter_multiplier = 2
            elif square_type == 'triple-letter':
                letter_multiplier = 3
            if square_type in ('double-word', 'star'):
                word_multiplier *= 2
            elif square_type == 'triple-word':
                word_multiplier *= 3

        score += letter_score * letter_multiplier
    score *= word_multiplier
    if len(newly_placed_set) == 7:  
        score += 50
    return score

def is_valid_placement(board, placed_tiles, dictionary : Trie, first_turn=False):
    """
    placed_tiles: list of (row, col, letter) for the move
    board: 2D list of current board state
    dictionary: Trie object containing valid words
    first_turn: bool, True if this is the first move
    Returns: (valid: bool, message: str)
    """
    if not placed_tiles:
        return False, "No tiles placed."

    rows = [r for r, c, l in placed_tiles]
    cols = [c for r, c, l in placed_tiles]

    all_same_row = all(r == rows[0] for r in rows)
    all_same_col = all(c == cols[0] for c in cols)

    if not (all_same_row or all_same_col):
        return False, "Tiles must be in the same row or column."

    if all_same_row:
        indices = sorted(cols)
        fixed = rows[0]
        axis = 'col'
    else:
        indices = sorted(rows)
        fixed = cols[0]
        axis = 'row'

    for i in range(indices[0], indices[-1] + 1):
        if axis == 'col':
            if board[fixed][i] == '' and (fixed, i, None) not in placed_tiles and (fixed, i) not in [(r, c) for r, c, l in placed_tiles]:
                return False, "Tiles must be contiguous."
        else:
            if board[i][fixed] == '' and (i, fixed, None) not in placed_tiles and (i, fixed) not in [(r, c) for r, c, l in placed_tiles]:
                return False, "Tiles must be contiguous."

    if not first_turn:
        connects = False
        for r, c, l in placed_tiles:
            for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                nr, nc = r+dr, c+dc
                if 0 <= nr < len(board) and 0 <= nc < len(board[0]):
                    if board[nr][nc] != '':
                        connects = True
        if not connects:
            return False, "Move must connect to existing tiles."

    temp_board = [row[:] for row in board]
    for r, c, l in placed_tiles:
        temp_board[r][c] = l

    def get_word(r, c, dr, dc):
        
        while 0 <= r-dr < len(board) and 0 <= c-dc < len(board[0]) and temp_board[r-dr][c-dc] != '':
            r -= dr
            c -= dc
        word = ''
        positions = []
        while 0 <= r < len(board) and 0 <= c < len(board[0]) and temp_board[r][c] != '':
            word += temp_board[r][c]
            positions.append((r, c))
            r += dr
            c += dc
        return word, positions

    words_to_check = []
    if all_same_row:
        main_word, _ = get_word(rows[0], indices[0], 0, 1)
        if len(main_word) > 1:
            words_to_check.append(main_word)
        
        for c in indices:
            perp_word, _ = get_word(rows[0], c, 1, 0)
            if len(perp_word) > 1:
                words_to_check.append(perp_word)
    else:
        main_word, _ = get_word(indices[0], cols[0], 1, 0)
        if len(main_word) > 1:
            words_to_check.append(main_word)
        for r in indices:
            perp_word, _ = get_word(r, cols[0], 0, 1)
            if len(perp_word) > 1:
                words_to_check.append(perp_word)

    for word in words_to_check:
        if not dictionary.contains(word):
            return False, f"{word} is not in the dictionary."

    return True, "Valid move."

print("Opening dictionary...")
dictionary = Trie()
try:
    start_time = time.time()
    with open("./docs/wordlist.txt", "r") as file:
        for line in file: 
            word = line.strip().upper()
            dictionary.insert(word)
    end_time = time.time()
    print(f"Loading time: {round(end_time - start_time, 2)} seconds")
except Exception as e:
    print(f"Error loading file: {e}")
    exit()
    
if __name__ == "__main__":
    app.run(debug=True)