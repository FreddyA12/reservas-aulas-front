package gestorreservasaulas.interfaces;

import gestorreservasaulas.entidades.Aula;
import gestorreservasaulas.entidades.Bloque;
import gestorreservasaulas.entidades.Laboratorio;
import gestorreservasaulas.servicios.ServicioAula;
import gestorreservasaulas.servicios.ServicioBloque;
import gestorreservasaulas.servicios.ServicioLaboratorio;
import jakarta.annotation.PostConstruct;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.util.List;

@Component
public class PnlAulasLaboratorios extends javax.swing.JPanel {

    @Autowired
    private ServicioAula servicioAula;

    @Autowired
    private ServicioLaboratorio servicioLaboratorio;

    @Autowired
    private FrmCrearAulas frmcrearAula;
    
    @Autowired
    private  FrmCrearLaboratorio FrmCrearLaboratorio;
    
    @Autowired
    private FrmEditarAulas frmeditarAulas;
    
    @Autowired
    private FrmEditarLaboratorio frmeditarLab;
    
    @Autowired
    private ServicioBloque servicioBloque;
    private Aula aulaSeleccionada;
    private Laboratorio labSeleccionada;
    

    private DefaultTableModel model = new DefaultTableModel(new String[]{"id", "Nombre", "Piso", "Capacidad"}, 0);
    private List<Aula> aulas;
    private List<Laboratorio> laboratorios;
    private List<Bloque> bloques;
    
   

    public PnlAulasLaboratorios() {
        initComponents();
        cargarAulasLabPorBloque();
    }

    @PostConstruct
    private void iniciar() {
        setVisible(true);
        jTable1.setModel(model);
        combo();
        cargarAulasLabPorBloque();
    }

    public void combo() {
        bloques = servicioBloque.obtenerTodosBloques();
        for (Bloque block : bloques) {
            jcbxBloque.addItem(block);
        }

    }

    public void cargarAulasLabPorBloque() {
        Bloque bloqueSeleccionado = (Bloque) jcbxBloque.getSelectedItem();
        if (bloqueSeleccionado == null) {
            return; // Si no hay ningún bloque seleccionado, salir del método
        }

        Long idBloque = bloqueSeleccionado.getId(); // Obtener el ID del bloque seleccionado
        String tipoSeleccionado = jcbxAula.getSelectedItem().toString();
        DefaultTableModel model = (DefaultTableModel) jTable1.getModel();
        model.setRowCount(0); // Limpia la tabla antes de añadir nuevos datos

        if ("Aulas".equals(tipoSeleccionado)) {
            aulas = servicioAula.findByBloque(idBloque);
            if (aulas != null && !aulas.isEmpty()) {
                for (Aula aula : aulas) {
                    Object[] datos = {aula.getId(), aula.getNombre(), aula.getPiso(), aula.getCapacidad()};
                    model.addRow(datos);
                }
            } else {
                JOptionPane.showMessageDialog(null, "No hay aulas para este bloque");
            }
        } else {
            laboratorios = servicioLaboratorio.findByBloque(idBloque);
            if (laboratorios != null && !laboratorios.isEmpty()) {
                for (Laboratorio lab : laboratorios) {
                    Object[] datos = {lab.getId(), lab.getNombre(), lab.getPiso(), lab.getCapacidad()};
                    model.addRow(datos);
                }
            } else {
                JOptionPane.showMessageDialog(null, "No hay Laboratorios para este bloque");
            }
        }
    }

    private Aula actualizarAulaSeleccionada() {
        int fila = jTable1.getSelectedRow();
        if (fila != -1) {
            Long id = Long.parseLong(jTable1.getValueAt(fila, 0).toString());
            String nombre = jTable1.getValueAt(fila, 1).toString();
            int capacidad = Integer.parseInt(jTable1.getValueAt(fila, 2).toString());

            if (aulaSeleccionada == null) {
                aulaSeleccionada = new Aula(); // Solo se crea una vez si es necesario
            }
            aulaSeleccionada.setId(id);
            aulaSeleccionada.setNombre(nombre);
            aulaSeleccionada.setCapacidad(capacidad);
        }
        return aulaSeleccionada;
    }

    private Laboratorio actualizarLaboratorioSeleccionado() {
        int fila = jTable1.getSelectedRow();
        if (fila != -1) {
            Long id = Long.parseLong(jTable1.getValueAt(fila, 0).toString());
            String nombre = jTable1.getValueAt(fila, 1).toString();
            int capacidad = Integer.parseInt(jTable1.getValueAt(fila, 2).toString());

            if (labSeleccionada == null) {
                labSeleccionada = new Laboratorio(); // Solo se crea una vez si es necesario
            }
            labSeleccionada.setId(id);
            labSeleccionada.setNombre(nombre);
            labSeleccionada.setCapacidad(capacidad);
        }
        return labSeleccionada;
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */

    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jLabel1 = new javax.swing.JLabel();
        jcbxBloque = new javax.swing.JComboBox<>();
        jcbxAula = new javax.swing.JComboBox<>();
        jLabel2 = new javax.swing.JLabel();
        jTextField1 = new javax.swing.JTextField();
        jTextField2 = new javax.swing.JTextField();
        jScrollPane1 = new javax.swing.JScrollPane();
        jTable1 = new javax.swing.JTable();
        btnCrear = new javax.swing.JButton();
        btnEditar = new javax.swing.JButton();
        jButton3 = new javax.swing.JButton();
        btneliminar = new javax.swing.JButton();
        jButton5 = new javax.swing.JButton();

        setBackground(new java.awt.Color(255, 255, 255));
        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        jLabel1.setFont(new java.awt.Font("Segoe UI", 1, 14)); // NOI18N
        jLabel1.setText("Capacidad:");
        add(jLabel1, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 170, -1, -1));

        jcbxBloque.addItemListener(new java.awt.event.ItemListener() {
            public void itemStateChanged(java.awt.event.ItemEvent evt) {

            }
        });
        jcbxBloque.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {

            }
        });
        jcbxBloque.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jcbxBloqueActionPerformed(evt);
            }
        });
        add(jcbxBloque, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 50, 250, -1));

        jcbxAula.setModel(new javax.swing.DefaultComboBoxModel<>(new String[] { "Aulas", "Laboratorios", " " }));
        jcbxAula.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jcbxAulaActionPerformed(evt);
            }
        });
        add(jcbxAula, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 100, 250, -1));

        jLabel2.setFont(new java.awt.Font("Segoe UI", 1, 14)); // NOI18N
        jLabel2.setText("Nombre:");
        add(jLabel2, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 140, -1, -1));

        jTextField1.setText("jTextField1");
        add(jTextField1, new org.netbeans.lib.awtextra.AbsoluteConstraints(170, 140, 170, -1));

        jTextField2.setText("jTextField1");
        add(jTextField2, new org.netbeans.lib.awtextra.AbsoluteConstraints(170, 170, 170, -1));

        jTable1.setModel(new javax.swing.table.DefaultTableModel(
            new Object [][] {
                {null, null, null, null},
                {null, null, null, null},
                {null, null, null, null},
                {null, null, null, null}
            },
            new String [] {
                "Title 1", "Title 2", "Title 3", "Title 4"
            }
        ));
        jScrollPane1.setViewportView(jTable1);

        add(jScrollPane1, new org.netbeans.lib.awtextra.AbsoluteConstraints(90, 210, 810, 250));

        btnCrear.setFont(new java.awt.Font("Segoe UI", 1, 12)); // NOI18N
        btnCrear.setText("Crear");
        btnCrear.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                btnCrearActionPerformed(evt);
            }
        });
        add(btnCrear, new org.netbeans.lib.awtextra.AbsoluteConstraints(420, 90, -1, -1));

        btnEditar.setFont(new java.awt.Font("Segoe UI", 1, 12)); // NOI18N
        btnEditar.setText("Editar");
        btnEditar.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                btnEditarActionPerformed(evt);
            }
        });
        add(btnEditar, new org.netbeans.lib.awtextra.AbsoluteConstraints(420, 140, -1, -1));

        jButton3.setFont(new java.awt.Font("Segoe UI", 1, 12)); // NOI18N
        jButton3.setText("Reservar");
        add(jButton3, new org.netbeans.lib.awtextra.AbsoluteConstraints(920, 430, -1, -1));

        btneliminar.setFont(new java.awt.Font("Segoe UI", 1, 12)); // NOI18N
        btneliminar.setText("Eliminar");
        btneliminar.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                btneliminarActionPerformed(evt);
            }
        });
        add(btneliminar, new org.netbeans.lib.awtextra.AbsoluteConstraints(550, 90, -1, -1));

        jButton5.setFont(new java.awt.Font("Segoe UI", 1, 12)); // NOI18N
        jButton5.setText("Horarios");
        jButton5.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                jButton5ActionPerformed(evt);
            }
        });
        add(jButton5, new org.netbeans.lib.awtextra.AbsoluteConstraints(550, 140, -1, -1));
    }// </editor-fold>//GEN-END:initComponents

    private void jcbxBloqueActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jcbxBloqueActionPerformed
        cargarAulasLabPorBloque();
    }//GEN-LAST:event_jcbxBloqueActionPerformed

    private void jcbxAulaActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jcbxAulaActionPerformed
        cargarAulasLabPorBloque();
    }//GEN-LAST:event_jcbxAulaActionPerformed

    private void jButton5ActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_jButton5ActionPerformed
        // TODO add your handling code here:
        String tipoSeleccionado = jcbxAula.getSelectedItem().toString();
        if ("Aulas".equals(tipoSeleccionado)) {
            actualizarAulaSeleccionada();
            if (aulaSeleccionada != null) {
                System.out.println(aulaSeleccionada.getNombre()); // Aquí podrías mostrar los detalles o hacer algo con el objeto aula
            }
        } else if ("Laboratorios".equals(tipoSeleccionado)) {
            actualizarLaboratorioSeleccionado();
            if (labSeleccionada != null) {
                System.out.println(labSeleccionada); // Aquí podrías mostrar los detalles o hacer algo con el objeto laboratorio
            }
        }
    }//GEN-LAST:event_jButton5ActionPerformed

    private void btnCrearActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_btnCrearActionPerformed
           String tipoSeleccionado = jcbxAula.getSelectedItem().toString();
           
        if ("Aulas".equals(tipoSeleccionado)) {
            frmcrearAula.setVisible(true);
            
        } else if ("Laboratorios".equals(tipoSeleccionado)) {
           FrmCrearLaboratorio.setVisible(true);
        }
       
    
    }//GEN-LAST:event_btnCrearActionPerformed

    private void btnEditarActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_btnEditarActionPerformed
        int fila = jTable1.getSelectedRow();
    if (fila != -1) {
        Long id = Long.parseLong(jTable1.getValueAt(fila, 0).toString());
        String nombre = jTable1.getValueAt(fila, 1).toString();
        int piso = Integer.parseInt(jTable1.getValueAt(fila, 2).toString());
        int capacidad = Integer.parseInt(jTable1.getValueAt(fila, 3).toString());
        Bloque bloqueSeleccionado = (Bloque) jcbxBloque.getSelectedItem();

        String tipoSeleccionado = jcbxAula.getSelectedItem().toString();
        
        if ("Aulas".equals(tipoSeleccionado)) {
            Aula aula = new Aula();
            aula.setId(id);
            aula.setNombre(nombre);
            aula.setPiso(piso);
            aula.setCapacidad(capacidad);
            aula.setBloque(bloqueSeleccionado);

            frmeditarAulas.LlevaraAula(aula);
            frmeditarAulas.setVisible(true);
        } else if ("Laboratorios".equals(tipoSeleccionado)) {
             Laboratorio laboratorio = new Laboratorio();
             laboratorio.setId(id);
             laboratorio.setNombre(nombre);
             laboratorio.setPiso(piso);
             laboratorio.setCapacidad(capacidad);
             laboratorio.setBloque(bloqueSeleccionado);

             frmeditarLab.LlevaraLab(laboratorio);
             frmeditarLab.setVisible(true);
        }
        
    }else{
        JOptionPane.showMessageDialog(null, "Seleccione una fila para editar");
    }
    }//GEN-LAST:event_btnEditarActionPerformed

    private void btneliminarActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_btneliminarActionPerformed
           int fila = jTable1.getSelectedRow();
    if (fila != -1) {
        int confirm = JOptionPane.showConfirmDialog(null, "¿Estás seguro de que quiere eliminar esta fila?", "Confirmar eliminación", JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            Long id = Long.parseLong(jTable1.getValueAt(fila, 0).toString());
            String tipoSeleccionado = jcbxAula.getSelectedItem().toString();

            if ("Aulas".equals(tipoSeleccionado)) {
                servicioAula.eliminarAula(id);
            } else if ("Laboratorios".equals(tipoSeleccionado)) {
               // servicioLaboratorio.eliminarLaboratorio(id);
            }

            cargarAulasLabPorBloque(); 
            JOptionPane.showMessageDialog(null, "Fila eliminada correctamente");
        }
    } else {
        JOptionPane.showMessageDialog(null, "Selecciona una fila para eliminar");
    }
    }//GEN-LAST:event_btneliminarActionPerformed
 
    
    
    
    public static void main(String args[]) {
        /* Set the Nimbus look and feel */
        //<editor-fold defaultstate="collapsed" desc=" Look and feel setting code (optional) ">
        /* If Nimbus (introduced in Java SE 6) is not available, stay with the default look and feel.
         * For details see http://download.oracle.com/javase/tutorial/uiswing/lookandfeel/plaf.html
         */
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ClassNotFoundException ex) {
            java.util.logging.Logger.getLogger(FrmPrincipal.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            java.util.logging.Logger.getLogger(FrmPrincipal.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            java.util.logging.Logger.getLogger(FrmPrincipal.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        } catch (javax.swing.UnsupportedLookAndFeelException ex) {
            java.util.logging.Logger.getLogger(FrmPrincipal.class.getName()).log(java.util.logging.Level.SEVERE, null, ex);
        }
        //</editor-fold>
        //</editor-fold>

        /* Create and display the form */
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                new PnlAulasLaboratorios().setVisible(true);
            }
        });
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton btnCrear;
    private javax.swing.JButton btnEditar;
    private javax.swing.JButton btneliminar;
    private javax.swing.JButton jButton3;
    private javax.swing.JButton jButton5;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JTable jTable1;
    private javax.swing.JTextField jTextField1;
    private javax.swing.JTextField jTextField2;
    private javax.swing.JComboBox<String> jcbxAula;
    private javax.swing.JComboBox<Bloque> jcbxBloque;
    // End of variables declaration//GEN-END:variables
}
