import { motion } from 'motion/react';

export default function BrandStory() {
  return (
    <section id="historia" className="py-24 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl mb-8">Nuestra Historia</h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-light italic">
            "Luna Gold Creaciones nace de la fascinación por la pureza orgánica. Cada pieza es un tributo a la elegancia natural, combinando la mística de las perlas con la nobleza del oro 18k. Buscamos transmitir sofisticación a través de la simplicidad, creando joyas que no solo se usan, sino que se sienten."
          </p>
          <div className="mt-10 w-12 h-[1px] bg-gold mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}
