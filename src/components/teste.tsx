import { useEffect } from "react";
import styles from "./TableReader.module.css";
import { useTableReader } from "./useTableReader";
import { ZodObject, ZodRawShape } from "zod";
import { useTableVirtualization } from "./useTableVirtualization";

export interface TableReaderProps<T extends ZodRawShape> {
  file: File | null;
  schema?: ZodObject<T>;
  height?: number;
  rowHeight?: number;
  overscan?: number;
}

export function TableReader<T extends ZodRawShape>({
  file,
  height = 520,
  rowHeight = 40,
  overscan = 8,
}: TableReaderProps<T>) {
  if (file === null) {
    return <p style={{ color: "black" }}>Selecione um arquivo, para exibir</p>;
  }

  const { data, headers, onProcessingFile } = useTableReader(file);

  const {
    gridVars,
    viewportRef,
    totalHeight,
    visibleRows,
    offsetY,
    setScrollTop,
    startIndex,
  } = useTableVirtualization({ data, headers, height, rowHeight, overscan });

  useEffect(() => {
    onProcessingFile();
  }, [file]);

  return (
    <div style={gridVars} className={styles.container}>
      <div className={styles.thead}>
        <div className={styles.tr}>
          <div className={styles.thIndex}>#</div>
          {headers.map((h) => (
            <div key={h} className={styles.th}>
              {h}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        style={{ height }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleRows.map((row, i) => {
              const rowIndex = startIndex + i;

              return (
                <div
                  key={rowIndex}
                  className={`${styles.tr} ${styles.row}`}
                  style={{ height: rowHeight }}
                >
                  <div className={styles.tdIndex}>{rowIndex + 1}</div>

                  {headers.map((header) => (
                    <div key={`${rowIndex}-${header}`} className={styles.td}>
                      <input
                        type="text"
                        defaultValue={
                          row[header] != null ? String(row[header]) : ""
                        }
                        className={styles.input}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
