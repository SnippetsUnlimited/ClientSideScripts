/////////////////////////////////////////////////////////////////////////////////////////////////////////

"use strict";

function TypeChecker() {
}

TypeChecker.TypeNames = [
    "string",
    "integer",
    "float",
    "bool",
    "null",
    "undefined",
    "object"
];

TypeChecker.GetType = function (value) {
    if (typeof value == "string") {
        return TypeChecker.TypeNames[0];
    }
    else if (typeof value == "number") {
        if (parseInt(value) == value) {
            return TypeChecker.TypeNames[1];
        }
        else {
            return TypeChecker.TypeNames[2];
        }
    }
    else if (typeof value == "boolean") {
        return TypeChecker.TypeNames[3];
    }
    else if (typeof value == "null") {
        return TypeChecker.TypeNames[4];
    }
    else if (typeof value == "undefined") {
        return TypeChecker.TypeNames[5];
    }
    else {
        return TypeChecker.TypeNames[6];
    }
};

TypeChecker.IsString = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[0]);
}

TypeChecker.IsInteger = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[1]);
}

TypeChecker.IsFloat = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[2]);
}

TypeChecker.IsBoolean = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[3]);
}

TypeChecker.IsNull = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[4]);
}

TypeChecker.IsUndefined = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[5]);
}

TypeChecker.IsObject = function (value) {
    return (this.GetType(value) == TypeChecker.TypeNames[6]);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function FuzzyCharacterMapInfo(english, urdu, backspaces) {
    this.English = english; //char
    this.Urdu = urdu; //array of char
    this.Backspaces = backspaces; //int
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function CharacterToken() {
    this.Value = 0; //char
    this.IsFirst = false; //bool
    this.IsLast = false; //bool
    this.IsVowel = false; //bool
    this.IsValid = false; //bool
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function TrieNode() {
    this.Parent = null; //TrieNode 
    this.Word = null; // string
    this.Character = 0; //char
    this.Children = []; // [{char: TrieNode}]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Trie() {
    var data = {
        root: new TrieNode()
    };

    Trie.prototype.GetRoot = function () {
        return data.root;
    }
}

Trie.prototype.AddWord = function (word) { //(string)

    if (TypeChecker.IsString(word) && word.length > 0) {

        var node = this.GetRoot();

        for (var x = 0; x < word.length; x++) {
            var currChar = word.charCodeAt(x);

            if (node.Children[currChar] == null) {
                var child = new TrieNode();
                child.Character = currChar;
                child.Parent = node;

                node.Children[currChar] = child;
                node = child;
            }
            else {
                node = node.Children[currChar];
            }
        }

        if (node.Word == null) {
            node.Word = word;
        }
    }

}

Trie.prototype.GetMatches = function (word) {

    var result = [];

    if (TypeChecker.IsString(word) && word.length > 0) {
        var node = this.GetRoot();

        for (var x = 0; x < word.length; x++) {
            var currChar = word.charCodeAt(x);

            if (node.Children[currChar] != null) {
                node = node.Children[currChar];
            }
            else {
                node = null;
                break;
            }
        }

        if (node != null) {
            if (node.Word != null) {
                result.push(node.Word);
            }
            this.GetMatchesRecursive(node, result);
        }
    }

    return result;
}

Trie.prototype.GetMatchesRecursive = function me(node, result) {
    if (node != null) {

        node.Children.forEach(function (item, index, array) {

            if (item.Word != null) {
                result.push(item.Word);
            }

            me(item, result);
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ParseState() {
    this.Node = null; //TrieNode
    this.PreviousIndex = -1; //int
    this.MissedStack = []; //char[]
    this.MissedIndex = -1; //int
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
function FuzzyTrie() {
    Trie.call(this);
}

FuzzyTrie.prototype = new Trie();
FuzzyTrie.prototype.constructor = FuzzyTrie;

FuzzyTrie.prototype.GetExactMatchingCharacters = function (curr, prev, next) {

    var currChar = String.fromCharCode(curr.Value);
    var prevChar = (prev != null) ? String.fromCharCode(prev.Value) : 0;
    var currIsFirst = curr.IsFirst;
    var currIsLast = curr.IsLast;
    var prevIsFirst = (prev != null) ? prev.IsFirst : false;

    switch (currChar) {
        case '0':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }

        case 'a':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['آ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0)
                ];
            }
            else if (prevChar == 'a' && prevIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['آ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع', 'ا'], 0)
                ];
            }
            else if (!currIsLast) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع', 'ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0)
                ];
            }

        case 'b':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ب'], 0)
            ];

        case 'c':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ک'], 0),
                //new FuzzyCharacterMapInfo(currChar, ['س'], 0),
                //new FuzzyCharacterMapInfo(currChar, ['ث'], 0),
                //new FuzzyCharacterMapInfo(currChar, ['ص'], 0)
            ];

        case 'd':
            return [
                new FuzzyCharacterMapInfo(currChar, ['د'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ڈ'], 0)
            ];

        case 'e':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0)
                ];
            }
            else if (!currIsLast) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ے'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ۓ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ے'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ۓ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }

        case 'f':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ف'], 0)
            ];

        case 'g': return [
            new FuzzyCharacterMapInfo(currChar, ['گ'], 0),
            new FuzzyCharacterMapInfo(currChar, ['غ'], 0)
        ];

        case 'h':
            if (prevChar == 'c') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['چ'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }
            else if (prevChar == 'k') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['خ'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }
            else if (prevChar == 's') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ش'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }
            else if (prevChar == 'g') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['غ'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }
            else if (prevChar == 'p') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ف'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ہ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ھ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ح'], 0)
                ];
            }

        case 'i':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['آ', 'ئ'], 0),
                ];
            }
            else if (prevChar == 'c') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ش'], 1),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            if (prevChar == 'a') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ئ', 'ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ئ'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ے'], 1),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            else if (!currIsLast) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ا', 'ئ'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ے'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ئ', 'ی'], 0)
                ];
            }

        case 'j':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ج'], 0)
            ];

        case 'k':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ک'], 0)
            ];

        case 'l':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ل'], 0)
            ];

        case 'm':
            return [
                new FuzzyCharacterMapInfo(currChar, ['م'], 0)
            ];

        case 'n':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ن'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ں'], 0)
            ];

        case 'o':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ا', 'و'], 0)
                ];
            }
            else if (prevChar == 'a') {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ؤ'], 0)
                ];
            }
            else if (prevChar == 'w' || prevChar == 'v') {
                return [
                    new FuzzyCharacterMapInfo(currChar, [0], 0),
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['و'], 0)
                ];
            }

        case 'p':
            return [
                new FuzzyCharacterMapInfo(currChar, ['پ'], 0)
            ];

        case 'q':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ق'], 0)
            ];

        case 'r':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ر'], 0)
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ر'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ڑ'], 0)
                ];
            }

        case 's':
            return [
                new FuzzyCharacterMapInfo(currChar, ['س'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ث'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ص'], 0)
            ];

        case 't':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ت'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ٹ'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ط'], 0)
            ];

        case 'u':
            if (currIsFirst) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['ا'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ع'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['ا', 'و'], 0)
                ];
            }
            else if (!currIsLast) {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['و'], 0),
                    new FuzzyCharacterMapInfo(currChar, [0], 0),
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['و'], 0),
                ];
            }

        case 'v':
        case 'w':
            if (prevChar == 'o') {
                return [
                    new FuzzyCharacterMapInfo(currChar, [0], 0),
                ];
            }
            else {
                return [
                    new FuzzyCharacterMapInfo(currChar, ['و'], 0),
                    new FuzzyCharacterMapInfo(currChar, ['و', 'و'], 0)
                ];
            }

        case 'x':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ش'], 0)
            ];

        case 'y':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ی'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ے'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ۓ'], 0),

            ];

        case 'z':
            return [
                new FuzzyCharacterMapInfo(currChar, ['ز'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ذ'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ض'], 0),
                new FuzzyCharacterMapInfo(currChar, ['ظ'], 0)
            ];

    }

    return [
        new FuzzyCharacterMapInfo(currChar, [currChar], 0)
    ];

}

FuzzyTrie.prototype.GetResolvedCharacters = function (english, currIndex, prevIndex) {

    var _vowels = "aeiou";
    var _acceptableCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    var curr = null;
    var prev = null;
    var next = null;

    curr = new CharacterToken();
    curr.Value = english.charCodeAt(currIndex);
    curr.IsFirst = (currIndex == 0);
    curr.IsLast = (english.length == currIndex + 1),
    curr.IsVowel = (_vowels.indexOf(english.charCodeAt(currIndex)) > -1);

    if (currIndex > 0) {
        prev = new CharacterToken();
        prev.Value = (prevIndex > -1) ? english.charCodeAt(prevIndex) : 0;
        prev.IsFirst = prevIndex == 0;
        prev.IsLast = false;
        prev.IsVowel = (_vowels.indexOf(english.charCodeAt(currIndex - 1)) > -1);
    }

    if (currIndex + 1 < english.length) {
        next = new CharacterToken();
        next.Value = english.charCodeAt(currIndex + 1);
        next.IsFirst = false;
        next.IsLast = (english.length == currIndex + 2);
        next.IsVowel = (_vowels.indexOf(english.charCodeAt(currIndex + 1)) > -1);
    }

    return FuzzyTrie.prototype.GetExactMatchingCharacters(curr, prev, next);
}

FuzzyTrie.prototype.GetFuzzy = function (english, result) {

    var stateList = [];
    var baseState = new ParseState();

    baseState.Node = FuzzyTrie.prototype.GetRoot();
    baseState.PreviousIndex = -2;

    stateList.push(baseState);

    if (english.length > 0) {
        for (var x = 0; x < english.length; x++) {

            var states = stateList.slice(0);

            //console.log(states.length);

            states.forEach(function (state, index, states) {

                //console.log(stateList.length);


                for (var y = 0; y < stateList.length; y++) {
                    if (stateList[y].Node == state.Node || stateList[y] == null) {
                        stateList.splice(y--, 1);
                    }
                }

                //console.log(stateList.length);

                var currentIndex = x;
                var previousIndex = state.PreviousIndex;
                var currChar = english.charCodeAt(currentIndex);

                var fuzzyChars = FuzzyTrie.prototype.GetResolvedCharacters(english, currentIndex, previousIndex);

                //console.log(fuzzyChars);

                fuzzyChars.forEach(function (fc, index, fuzzyChars) {

                    var newNode = state.Node;

                    if (fc.Backspaces > 0) {
                        var bsp = fc.Backspaces;

                        while (state.MissedIndex > -1) {
                            state.MissedStack[state.MissedIndex--] = 0;
                            bsp--;
                        }

                        // backspace tree
                        while (bsp > 0) {
                            newNode = newNode.Parent;
                            bsp--;
                        }
                    }

                    var charState = new ParseState();
                    charState.MissedIndex = state.MissedIndex;
                    charState.MissedStack = state.MissedStack.splice(0);

                    if (fc.Urdu[0] == 0) {

                        var newPreviousIndex = currentIndex - fc.Backspaces - 1;
                        charState.PreviousIndex = newPreviousIndex;
                        charState.Node = newNode;
                        stateList.push(charState);
                    }
                    else {
                        var nx = newNode;

                        for (var t = 0; t < fc.Urdu.length; t++) {
                            //console.log(fc.Urdu[t]);
                            if (charState.MissedIndex < 0 && nx.Children[fc.Urdu[t].charCodeAt(0)] != null) {
                                nx = nx.Children[fc.Urdu[t].charCodeAt(0)];
                            }
                            else {
                                charState.MissedStack[++charState.MissedIndex] = fc.Urdu[t].charCodeAt(0);
                            }
                        }

                        if (charState.MissedIndex < 5) {
                            charState.PreviousIndex = currentIndex;
                            charState.Node = nx;
                            stateList.push(charState);
                            //console.log(charState.MissedIndex);
                        }
                    }
                });

            });
        }

        //console.log(stateList);
    }

    stateList.forEach(function (i, index, list) {

        var word = i.Node.Word;

        //console.log(word);
        //console.log(result.indexOf(word));
        //console.log(i.MissedIndex);

        if (word != null && i.MissedIndex < 0 && result.indexOf(word) < 0) {
            result.push(i.Node.Word);
        }
    });

}

FuzzyTrie.prototype.GetFuzzyMatches = function (english) {

    //for (var x = 0; x < english.length; x++)
    //{
    //    if (char.IsControl(english[x]))
    //    {
    //        english = english.Remove(x--, 1);
    //    }
    //}

    var result = [];
    FuzzyTrie.prototype.GetFuzzy(english, result);
    return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Dictionary() {

    if (Dictionary.prototype._singletonInstance) {
        return Dictionary.prototype._singletonInstance;
    }

    Dictionary.prototype._singletonInstance = this;
    var trie = new FuzzyTrie();

    this.GetMatches = function (urdu) {

        var results = [];
        if (TypeChecker.IsString(urdu) && urdu.length > 0) {
            results = trie.GetMatches(urdu);
        }
        return results;
    }

    this.GetEnglish2UrduFuzzyMatches = function (word) {
        var result = [];
        var en = EncodeWord(word);
        //result.push(en);
        result = trie.GetFuzzyMatches(en);
        ApplyRejectionFilter(word, result);
        return result;
    }

    function ApplyRejectionFilter(word, result) {
    }

    function EncodeWord(english) {
        var result = RemoveDuplicatesAndAddVowels(english);
        return result;
    }

    var vowels = "aeiou";
    var compounds = "csgkp";

    function RemoveDuplicatesAndAddVowels(english) {

        var res = [];

        if (TypeChecker.IsString(english) && english.length > 0) {

            var x = 0;
            var y = 0;
            var prevWsVowel = true;
            var currIsVowel = false;

            while (x < english.length) {

                if (x > 0) {
                    var prevChar = english.charCodeAt(x - 1);
                    var currChar = english.charCodeAt(x);

                    if (prevChar == currChar) {
                        if (x > 1) {
                            var prevprevChar = english.charCodeAt(x - 2);
                            if (!(currChar == 'h'.charCodeAt(0) && compounds.indexOf(String.fromCharCode(prevprevChar)) > -1)) {
                                x++;
                                continue;
                            }
                        }
                        else {
                            x++;
                            continue;
                        }
                    }
                }

                currIsVowel = (vowels.indexOf(currChar) > -1);

                if (currIsVowel) {
                    prevWsVowel = true;
                    res[y++] = english.charAt(x++);
                    continue;
                }

                if (!prevWsVowel) {
                    res[y++] = '0';
                }

                res[y++] = english.charAt(x++);
                prevWsVowel = false;
            }
        }

        return res.join("");
    }

    var Initialize = function () {
        // Load dictionary from file
        LoadDictionary();
    }

    var LoadDictionary = function () {

        var words = [];

        if (Dictionary.prototype.GetWords) {
            words = Dictionary.prototype.GetWords();
        }

        words.forEach(function (word, index, array) {
            if (TypeChecker.IsString(word) && word.length > 0) {
                trie.AddWord(word);
            }
        });
    }

    Initialize();
}

Dictionary.prototype.GetWords = function () {

    // defined in a seprate file.
    return (words) ? words : [];

}

Dictionary.GetInstance = function () {
    var singletonClass = new Dictionary();
    return singletonClass;
};

