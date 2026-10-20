import re,sys
PATH='/workspace/xboard/public/assets/admin/assets/index-CEIYH7i8.js'
SRC=open(PATH,encoding='utf-8',errors='replace').read()

def balanced(start):
    # start at index of '{' ; return substring of balanced braces
    assert SRC[start]=='{', (start, SRC[start-40:start+40])
    d=0; i=start; n=len(SRC)
    instr=None
    while i<n:
        c=SRC[i]
        if instr:
            if c=='\\': i+=2; continue
            if c==instr: instr=None
        else:
            if c in '"\'`': instr=c
            elif c=='{': d+=1
            elif c=='}':
                d-=1
                if d==0: return SRC[start:i+1]
        i+=1
    raise RuntimeError('unbalanced')

def fmt(body, indent=0):
    # crude beautifier: newline after ; { } when depth changes
    out=[]; d=0; instr=None; i=0; n=len(body)
    while i<n:
        c=body[i]
        if instr:
            out.append(c)
            if c=='\\': out.append(body[i+1]); i+=2; continue
            if c==instr: instr=None
            i+=1; continue
        if c in '"\'`': instr=c; out.append(c); i+=1; continue
        if c=='{':
            out.append('{\n'); d+=1; out.append('  '*d); i+=1; continue
        if c=='}':
            out.append('\n'+'  '*(d-1)+'}'); d-=1; i+=1; continue
        if c==';':
            out.append(';\n'+'  '*max(d,0)); i+=1; continue
        if c==',':
            out.append(',\n'+'  '*max(d,0)); i+=1; continue
        out.append(c); i+=1
    return ''.join(out)

if __name__=='__main__':
    name=sys.argv[1]; mode=sys.argv[2] if len(sys.argv)>2 else 'fn'
    if mode=='fn':
        m=re.search(r'function\s+'+re.escape(name)+r'\s*\(', SRC)
        start=SRC.index('{', m.start())
        body=balanced(start)
        print(fmt(body))
    else:  # page: const NAME=Object.freeze(...)
        m=re.search(re.escape(name)+r'\s*=\s*', SRC)
        start=SRC.index('{', m.start())
        body=balanced(start)
        print(body)
